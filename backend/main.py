
# ==========================================================================
# STATIC FRONTEND
# ==========================================================================
# Mount CSS / JS / assets under their folders so links like /css/style.css work.
if os.path.isdir(FRONTEND_DIR):
    for sub in ("css", "js", "assets"):
        path = os.path.join(FRONTEND_DIR, sub)
        if os.path.isdir(path):
            app.mount(f"/{sub}", StaticFiles(directory=path), name=sub)


def _page(name: str) -> FileResponse | JSONResponse:
    # Normalise: allow callers to pass either "chat" or "chat.html".
    if not name.endswith(".html"):
        name = f"{name}.html"
    file_path = os.path.join(FRONTEND_DIR, name)

    if os.path.isfile(file_path):
        return FileResponse(file_path)

    return JSONResponse({"detail": "Page not found"}, status_code=404)


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    fav_path = os.path.join(FRONTEND_DIR, "assets", "logo.svg")
    if os.path.isfile(fav_path):
        return FileResponse(fav_path, media_type="image/svg+xml")
    return Response(status_code=204)


@app.get("/assets/logo.png", include_in_schema=False)
async def logo_png():
    fav_path = os.path.join(FRONTEND_DIR, "assets", "logo.svg")
    if os.path.isfile(fav_path):
        return FileResponse(fav_path, media_type="image/svg+xml")
    return Response(status_code=404)


@app.get("/assets/logo-192.png", include_in_schema=False)
async def logo_192_png():
    fav_path = os.path.join(FRONTEND_DIR, "assets", "logo-192.svg")
    if os.path.isfile(fav_path):
        return FileResponse(fav_path, media_type="image/svg+xml")
    return Response(status_code=404)


@app.get("/assets/logo-512.png", include_in_schema=False)
async def logo_512_png():
    fav_path = os.path.join(FRONTEND_DIR, "assets", "logo-512.svg")
    if os.path.isfile(fav_path):
        return FileResponse(fav_path, media_type="image/svg+xml")
    return Response(status_code=404)


# ---------------------------------------------------------------------------
# PWA root files (must be served from the site root, not /assets).
# ---------------------------------------------------------------------------
@app.get("/manifest.json", include_in_schema=False)
async def manifest():
    return _file_or_404("manifest.json", "application/manifest+json")
