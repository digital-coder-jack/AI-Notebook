"""
=====================================================================
 STUDY SPHERE BOT  -  api/main.py
=====================================================================
A production-ready Telegram study bot.

 Architecture (how a message flows):

   Telegram  ──►  Vercel (POST /api/webhook)  ──►  FastAPI app
                                                      │
                                                      ▼
                                       python-telegram-bot Application
                                                      │
                                 ┌────────────────────┴───────────────┐
                                 ▼                                    ▼
                        Command handlers                       AI fallback
                     (/start /help /add ...)              (SQLite first, then
                                                            Groq API if not
                                                            found in database)

 Storage : SQLite (file auto-created on first run)
 Secrets : Read ONLY from environment variables - never hardcoded
=====================================================================
"""

import html
import logging
import os
import sqlite3
from contextlib import closing

import httpx
from fastapi import FastAPI, Request, Response
from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# ---------------------------------------------------------------------------
# 1. LOGGING
# ---------------------------------------------------------------------------
# Proper logging lets you debug problems in the Vercel dashboard logs.
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
# Silence the noisy httpx request logs (they would log every Telegram call).
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("study-sphere-bot")

# ---------------------------------------------------------------------------
# 2. CONFIGURATION (environment variables only - NEVER hardcode secrets!)
# ---------------------------------------------------------------------------
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Groq API settings (the key itself stays in the environment).
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

# SQLite database location.
#  - On Vercel the filesystem is READ-ONLY except for /tmp,
#    so we automatically use /tmp when running on Vercel.
#  - Locally we keep the file next to the project for easy inspection.
#  NOTE: /tmp on Vercel is EPHEMERAL (wiped between cold starts). For
#  permanent storage in production, point DB_PATH to a mounted volume or
#  switch to a hosted SQLite service (e.g. Turso). The code stays identical.
IS_VERCEL = os.environ.get("VERCEL") == "1"
DB_PATH = os.environ.get(
    "DB_PATH",
    "/tmp/study_sphere.db" if IS_VERCEL else "study_sphere.db",
)

if not TELEGRAM_BOT_TOKEN:
    # Fail fast with a clear message instead of a confusing crash later.
    logger.warning("TELEGRAM_BOT_TOKEN is not set! The bot cannot start without it.")


# ---------------------------------------------------------------------------
# 3. DATABASE LAYER (SQLite)
# ---------------------------------------------------------------------------
def get_connection() -> sqlite3.Connection:
    """
    Open a SQLite connection.
    sqlite3.connect() automatically CREATES the database file
    if it does not exist - no manual setup needed.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets us access columns by name
    return conn


def init_db() -> None:
    """Create the questions table if it does not exist yet."""
    with closing(get_connection()) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS questions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL,          -- Telegram user who saved it
                question    TEXT    NOT NULL,
                answer      TEXT    NOT NULL,
                created_at  TEXT    DEFAULT (datetime('now')),
                -- one user cannot save the same question twice
                UNIQUE (user_id, question)
            )
            """
        )
        conn.commit()
    logger.info("Database initialised at %s", DB_PATH)


def db_add_question(user_id: int, question: str, answer: str) -> bool:
    """
    Save a Q&A pair. Returns:
      True  -> saved successfully
      False -> duplicate question (already exists for this user)
    """
    try:
        with closing(get_connection()) as conn:
            conn.execute(
                "INSERT INTO questions (user_id, question, answer) VALUES (?, ?, ?)",
                (user_id, question.strip().lower(), answer.strip()),
            )
            conn.commit()
        return True
    except sqlite3.IntegrityError:
        # UNIQUE constraint failed -> duplicate question
        return False


def db_list_questions(user_id: int) -> list[sqlite3.Row]:
    """Return all saved questions for one user."""
    with closing(get_connection()) as conn:
        rows = conn.execute(
            "SELECT id, question, answer FROM questions "
            "WHERE user_id = ? ORDER BY id",
            (user_id,),
        ).fetchall()
    return rows


def db_delete_question(user_id: int, question_id: int) -> bool:
    """Delete one question by id. Returns True if a row was deleted."""
    with closing(get_connection()) as conn:
        cur = conn.execute(
            "DELETE FROM questions WHERE id = ? AND user_id = ?",
            (question_id, user_id),
        )
        conn.commit()
        return cur.rowcount > 0


def db_find_answer(user_id: int, question: str) -> str | None:
    """
    Look up an answer in the database (case-insensitive exact match).
    Returns the answer text or None if not found.
    """
    with closing(get_connection()) as conn:
        row = conn.execute(
            "SELECT answer FROM questions "
            "WHERE user_id = ? AND question = ? LIMIT 1",
            (user_id, question.strip().lower()),
        ).fetchone()
    return row["answer"] if row else None


# ---------------------------------------------------------------------------
# 4. GROQ AI CLIENT (the fallback brain)
# ---------------------------------------------------------------------------
async def ask_groq(question: str) -> str:
    """
    Send a question to the Groq API and return the AI's answer.
    Uses httpx (async) so the bot never blocks while waiting.
    """
    if not GROQ_API_KEY:
        return (
            "🤖 AI answers are not configured yet. "
            "Ask the bot admin to set the GROQ_API_KEY environment variable."
        )

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Study Sphere, a friendly study assistant. "
                    "Answer clearly and concisely for students. "
                    "Keep answers under 300 words."
                ),
            },
            {"role": "user", "content": question},
        ],
        "temperature": 0.7,
        "max_tokens": 512,
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",  # key from env, never hardcoded
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(GROQ_API_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as exc:
        logger.error("Groq API returned %s: %s", exc.response.status_code, exc.response.text)
        return "⚠️ The AI service returned an error. Please try again in a moment."
    except Exception:
        logger.exception("Unexpected error while calling Groq API")
        return "⚠️ I couldn't reach the AI service right now. Please try again later."


# ---------------------------------------------------------------------------
# 5. TELEGRAM COMMAND HANDLERS
# ---------------------------------------------------------------------------
WELCOME_TEXT = """\
👋 <b>Welcome to Study Sphere Bot!</b>

I help you build your own study Q&amp;A library and answer
anything else with AI. 📚🤖

<b>Available commands:</b>
/start — Show this welcome message
/help — How the bot works
/add — Save a question &amp; answer
       <i>Format:</i> <code>/add question | answer</code>
/list — Show your saved questions
/delete — Delete a question
       <i>Format:</i> <code>/delete ID</code>

💡 <b>Tip:</b> Just send me any question as a normal message.
I'll check your saved answers first, and if I don't find one,
I'll ask the AI for you!
"""

HELP_TEXT = """\
📖 <b>How Study Sphere Bot works</b>

<b>1️⃣ Save your own answers</b>
<code>/add What is photosynthesis? | The process plants use to convert light into energy.</code>
The part before <code>|</code> is the question, the part after is the answer.

<b>2️⃣ Review your library</b>
/list shows every question you saved, each with an ID number.

<b>3️⃣ Remove old entries</b>
<code>/delete 3</code> deletes the question with ID 3.

<b>4️⃣ Ask anything</b>
Send any text message (no command needed):
• If the question is in your library → you get <i>your</i> saved answer 📒
• If not → I ask the Groq AI and send you its answer 🤖

<b>Notes</b>
• Duplicate questions are rejected automatically.
• Your library is private — each user has their own.
"""


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/start — greet the user and list commands."""
    await update.message.reply_text(WELCOME_TEXT, parse_mode=ParseMode.HTML)


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/help — explain how the bot works."""
    await update.message.reply_text(HELP_TEXT, parse_mode=ParseMode.HTML)


async def cmd_add(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    /add question | answer
    Saves a Q&A pair to SQLite. Rejects duplicates.
    """
    user_id = update.effective_user.id
    # Everything after "/add " :
    raw = update.message.text.partition(" ")[2].strip()

    # Validate the "question | answer" format.
    if "|" not in raw:
        await update.message.reply_text(
            "❗ Wrong format.\n\n"
            "Use: /add question | answer\n"
            "Example:\n"
            "/add What is gravity? | A force that attracts objects toward each other."
        )
        return

    question, _, answer = raw.partition("|")
    question, answer = question.strip(), answer.strip()

    if not question or not answer:
        await update.message.reply_text(
            "❗ Both the question and the answer must not be empty.\n"
            "Use: /add question | answer"
        )
        return

    if db_add_question(user_id, question, answer):
        await update.message.reply_text(
            f"✅ Saved!\n\n❓ {question}\n💡 {answer}"
        )
    else:
        await update.message.reply_text(
            "⚠️ That question is already in your library.\n"
            "Use /list to see it, or /delete to remove it first."
        )


async def cmd_list(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/list — show all saved questions for this user."""
    user_id = update.effective_user.id
    rows = db_list_questions(user_id)

    if not rows:
        await update.message.reply_text(
            "📭 Your library is empty.\n"
            "Add your first entry with:\n"
            "/add question | answer"
        )
        return

    # Build a numbered list. html.escape prevents broken formatting
    # if a question contains characters like < or >.
    lines = ["📚 <b>Your saved questions:</b>\n"]
    for row in rows:
        lines.append(
            f"🆔 <b>{row['id']}</b> — {html.escape(row['question'])}\n"
            f"     💡 {html.escape(row['answer'])}\n"
        )
    lines.append("🗑 Delete one with: <code>/delete ID</code>")

    await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.HTML)


async def cmd_delete(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    /delete ID
    Deletes one saved question by its ID (shown in /list).
    """
    user_id = update.effective_user.id
    args = context.args  # words after the command, e.g. ["3"]

    if not args or not args[0].isdigit():
        await update.message.reply_text(
            "❗ Please give the ID of the question to delete.\n"
            "Example: /delete 3\n\n"
            "Use /list to see the IDs."
        )
        return

    question_id = int(args[0])
    if db_delete_question(user_id, question_id):
        await update.message.reply_text(f"🗑 Question {question_id} deleted.")
    else:
        await update.message.reply_text(
            f"⚠️ No question with ID {question_id} found in your library."
        )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    AI fallback for any plain text message:
      1. Search the SQLite database first.
      2. If found  -> return the saved answer.
      3. If missing -> ask the Groq API and return its answer.
    """
    user_id = update.effective_user.id
    question = update.message.text.strip()

    # Step 1: database lookup
    saved_answer = db_find_answer(user_id, question)
    if saved_answer:
        await update.message.reply_text(f"📒 From your library:\n\n{saved_answer}")
        return

    # Step 2: AI fallback — show "typing…" while we wait
    await update.message.chat.send_action("typing")
    ai_answer = await ask_groq(question)
    await update.message.reply_text(f"🤖 AI answer:\n\n{ai_answer}")


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Global error handler — logs every unhandled exception and
    tells the user something went wrong instead of staying silent.
    """
    logger.error("Exception while handling an update:", exc_info=context.error)
    if isinstance(update, Update) and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "😵 Oops, something went wrong. Please try again."
            )
        except Exception:
            # Even the apology failed — nothing more we can do.
            pass


# ---------------------------------------------------------------------------
# 6. TELEGRAM APPLICATION (webhook mode — NO run_polling!)
# ---------------------------------------------------------------------------
def build_application() -> Application:
    """Create the PTB Application and register all handlers."""
    application = (
        Application.builder()
        .token(TELEGRAM_BOT_TOKEN)
        .updater(None)  # webhook mode: we feed updates manually, no polling
        .build()
    )

    # Command handlers
    application.add_handler(CommandHandler("start", cmd_start))
    application.add_handler(CommandHandler("help", cmd_help))
    application.add_handler(CommandHandler("add", cmd_add))
    application.add_handler(CommandHandler("list", cmd_list))
    application.add_handler(CommandHandler("delete", cmd_delete))

    # AI fallback: any non-command text message
    application.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    # Global error handler
    application.add_error_handler(error_handler)

    return application


# Created once per serverless instance (reused across warm invocations).
ptb_app: Application | None = None


async def get_ptb_app() -> Application:
    """Lazily initialise the PTB application (once per cold start)."""
    global ptb_app
    if ptb_app is None:
        init_db()  # make sure the SQLite file + table exist
        ptb_app = build_application()
        await ptb_app.initialize()
        logger.info("Telegram application initialised")
    return ptb_app


# ---------------------------------------------------------------------------
# 7. FASTAPI WEB SERVER (this is what Vercel runs)
# ---------------------------------------------------------------------------
app = FastAPI(title="Study Sphere Bot", docs_url=None, redoc_url=None)


@app.get("/")
@app.get("/api/main")
async def health() -> dict:
    """Health check — open this URL in a browser to see the bot is alive."""
    return {"status": "ok", "bot": "Study Sphere Bot", "storage": "sqlite"}


@app.post("/api/webhook")
async def telegram_webhook(request: Request) -> Response:
    """
    Telegram sends every update (message, command, ...) to this endpoint
    as a POST request. We convert it into an Update object and let
    python-telegram-bot process it.
    """
    # Optional but recommended: verify the secret token so only
    # Telegram (not random strangers) can call this endpoint.
    secret = os.environ.get("WEBHOOK_SECRET")
    if secret:
        header = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
        if header != secret:
            logger.warning("Rejected webhook call with invalid secret token")
            return Response(status_code=403)

    try:
        application = await get_ptb_app()
        data = await request.json()
        update = Update.de_json(data, application.bot)
        await application.process_update(update)
    except Exception:
        # Log the error but still return 200 so Telegram does not
        # endlessly retry a broken update.
        logger.exception("Failed to process webhook update")

    return Response(status_code=200)


@app.get("/api/set-webhook")
async def set_webhook(request: Request) -> dict:
    """
    One-time helper: visit this URL in your browser AFTER deploying
    to register the webhook with Telegram automatically.

    Example: https://your-app.vercel.app/api/set-webhook
    """
    application = await get_ptb_app()
    # Build the public webhook URL from the incoming request host.
    host = request.headers.get("x-forwarded-host") or request.url.hostname
    webhook_url = f"https://{host}/api/webhook"

    ok = await application.bot.set_webhook(
        url=webhook_url,
        secret_token=os.environ.get("WEBHOOK_SECRET") or None,
        drop_pending_updates=True,
    )
    logger.info("Webhook set to %s (ok=%s)", webhook_url, ok)
    return {"webhook_set": ok, "url": webhook_url}


# ---------------------------------------------------------------------------
# 8. LOCAL DEVELOPMENT ENTRY POINT
# ---------------------------------------------------------------------------
# Vercel ignores this block. Run locally with:
#   uvicorn api.main:app --reload --port 8000
# then use a tunnel (e.g. ngrok) + /api/set-webhook for testing.
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
