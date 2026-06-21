package com.studysphere.ai.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studysphere.ai.data.Chat
import com.studysphere.ai.data.ChatMessage
import com.studysphere.ai.data.Repository
import com.studysphere.ai.data.StreamEvent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChatUiState(
    val chats: List<Chat> = emptyList(),
    val currentChatId: Int? = null,
    val currentTitle: String = "New Chat",
    val messages: List<ChatMessage> = emptyList(),
    val streaming: Boolean = false,
    val loading: Boolean = false,
    val error: String? = null
)

class ChatViewModel(private val repo: Repository) : ViewModel() {

    private val _state = MutableStateFlow(ChatUiState())
    val state: StateFlow<ChatUiState> = _state.asStateFlow()

    fun loadChats() {
        viewModelScope.launch {
            try {
                _state.value = _state.value.copy(chats = repo.listChats())
            } catch (e: Exception) {
                _state.value = _state.value.copy(error = e.message)
            }
        }
    }

    fun openChat(chatId: Int) {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            try {
                val detail = repo.getChat(chatId)
                _state.value = _state.value.copy(
                    loading = false,
                    currentChatId = detail.chat.id,
                    currentTitle = detail.chat.title,
                    messages = detail.messages
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(loading = false, error = e.message)
            }
        }
    }

    fun startNewChat() {
        _state.value = _state.value.copy(
            currentChatId = null,
            currentTitle = "New Chat",
            messages = emptyList(),
            error = null
        )
    }

    fun deleteChat(chatId: Int) {
        viewModelScope.launch {
            try {
                repo.deleteChat(chatId)
                if (_state.value.currentChatId == chatId) startNewChat()
                loadChats()
            } catch (e: Exception) {
                _state.value = _state.value.copy(error = e.message)
            }
        }
    }

    /** Send a message — creating a chat first if needed — and stream the reply. */
    fun send(content: String) {
        if (content.isBlank() || _state.value.streaming) return
        viewModelScope.launch {
            try {
                // Ensure a chat exists.
                var chatId = _state.value.currentChatId
                if (chatId == null) {
                    val chat = repo.newChat()
                    chatId = chat.id
                    _state.value = _state.value.copy(
                        currentChatId = chat.id,
                        currentTitle = chat.title
                    )
                }

                // Optimistically append the user's message + an empty assistant bubble.
                val userMsg = ChatMessage(id = -1, role = "user", content = content)
                val assistantMsg = ChatMessage(id = -2, role = "assistant", content = "")
                _state.value = _state.value.copy(
                    messages = _state.value.messages + userMsg + assistantMsg,
                    streaming = true,
                    error = null
                )

                val token = repo.currentToken()
                val sb = StringBuilder()
                repo.streamMessage(chatId, content, token).collect { event ->
                    when (event) {
                        is StreamEvent.Token -> {
                            sb.append(event.text)
                            updateLastAssistant(sb.toString())
                        }
                        is StreamEvent.Done -> {
                            _state.value = _state.value.copy(streaming = false)
                            loadChats()
                        }
                        is StreamEvent.Error -> {
                            if (sb.isEmpty()) updateLastAssistant("⚠️ ${event.message}")
                            _state.value = _state.value.copy(streaming = false)
                        }
                    }
                }
                // Safety: ensure streaming flag cleared when flow completes.
                if (_state.value.streaming) {
                    _state.value = _state.value.copy(streaming = false)
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(streaming = false, error = e.message)
            }
        }
    }

    private fun updateLastAssistant(text: String) {
        val msgs = _state.value.messages.toMutableList()
        val idx = msgs.indexOfLast { it.role == "assistant" }
        if (idx >= 0) {
            msgs[idx] = msgs[idx].copy(content = text)
            _state.value = _state.value.copy(messages = msgs)
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(error = null)
    }
}
