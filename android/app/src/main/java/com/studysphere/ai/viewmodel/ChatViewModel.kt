package com.studysphere.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studysphere.ai.data.model.ChatMessage
import com.studysphere.ai.data.model.ChatSession
import com.studysphere.ai.data.model.MessageRole
import com.studysphere.ai.data.repository.ChatRepository
import com.studysphere.ai.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChatUiState(
    val sessions: List<ChatSession> = emptyList(),
    val activeSessionId: String? = null,
    val messages: List<ChatMessage> = emptyList(),
    val selectedModelId: String = "lite-swift",
    val isLoadingSessions: Boolean = false,
    val isLoadingMessages: Boolean = false,
    val isSending: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    fun initialize(defaultModelId: String) {
        if (_uiState.value.sessions.isEmpty()) {
            _uiState.value = _uiState.value.copy(selectedModelId = defaultModelId)
            loadSessions(selectFirst = true)
        }
    }

    fun loadSessions(selectFirst: Boolean = false) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingSessions = true, error = null)
            when (val result = chatRepository.getSessions()) {
                is Resource.Success -> {
                    val sessions = result.data
                    _uiState.value = _uiState.value.copy(
                        sessions = sessions,
                        isLoadingSessions = false
                    )
                    if (selectFirst && _uiState.value.activeSessionId == null &&
                        sessions.isNotEmpty()
                    ) {
                        selectSession(sessions.first().id)
                    }
                }
                is Resource.Error -> _uiState.value = _uiState.value.copy(
                    isLoadingSessions = false,
                    error = result.message
                )
            }
        }
    }

    fun selectSession(sessionId: String) {
        val session = _uiState.value.sessions.find { it.id == sessionId }
        _uiState.value = _uiState.value.copy(
            activeSessionId = sessionId,
            selectedModelId = session?.modelId ?: _uiState.value.selectedModelId,
            isLoadingMessages = true,
            messages = emptyList()
        )
        viewModelScope.launch {
            when (val result = chatRepository.getMessages(sessionId)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(
                    messages = result.data,
                    isLoadingMessages = false
                )
                is Resource.Error -> _uiState.value = _uiState.value.copy(
                    isLoadingMessages = false,
                    error = result.message
                )
            }
        }
    }

    fun selectModel(modelId: String) {
        _uiState.value = _uiState.value.copy(selectedModelId = modelId)
    }

    fun newChat() {
        viewModelScope.launch {
            when (val result = chatRepository.createSession(_uiState.value.selectedModelId)) {
                is Resource.Success -> {
                    val session = result.data
                    _uiState.value = _uiState.value.copy(
                        sessions = listOf(session) + _uiState.value.sessions,
                        activeSessionId = session.id,
                        messages = emptyList()
                    )
                }
                is Resource.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }

    fun deleteSession(sessionId: String) {
        viewModelScope.launch {
            when (val result = chatRepository.deleteSession(sessionId)) {
                is Resource.Success -> {
                    val remaining = _uiState.value.sessions.filterNot { it.id == sessionId }
                    val newActive = if (_uiState.value.activeSessionId == sessionId) {
                        remaining.firstOrNull()?.id
                    } else {
                        _uiState.value.activeSessionId
                    }
                    _uiState.value = _uiState.value.copy(
                        sessions = remaining,
                        activeSessionId = newActive,
                        messages = if (newActive == null) emptyList() else _uiState.value.messages
                    )
                    newActive?.let { selectSession(it) }
                }
                is Resource.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }

    fun sendMessage(content: String) {
        val text = content.trim()
        if (text.isEmpty() || _uiState.value.isSending) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true, error = null)

            var sessionId = _uiState.value.activeSessionId
            if (sessionId == null) {
                when (val created = chatRepository.createSession(_uiState.value.selectedModelId)) {
                    is Resource.Success -> {
                        sessionId = created.data.id
                        _uiState.value = _uiState.value.copy(
                            sessions = listOf(created.data) + _uiState.value.sessions,
                            activeSessionId = sessionId
                        )
                    }
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isSending = false,
                            error = created.message
                        )
                        return@launch
                    }
                }
            }

            // Optimistic user message.
            val optimistic = ChatMessage(
                id = "temp-${System.currentTimeMillis()}",
                sessionId = sessionId,
                role = MessageRole.USER,
                content = text,
                modelId = _uiState.value.selectedModelId,
                createdAt = ""
            )
            _uiState.value = _uiState.value.copy(messages = _uiState.value.messages + optimistic)

            val result = chatRepository.sendMessage(
                sessionId,
                text,
                _uiState.value.selectedModelId
            )
            when (result) {
                is Resource.Success -> {
                    val (userMessage, assistantMessage) = result.data
                    val withoutOptimistic =
                        _uiState.value.messages.filterNot { it.id == optimistic.id }
                    _uiState.value = _uiState.value.copy(
                        messages = withoutOptimistic + userMessage + assistantMessage,
                        isSending = false
                    )
                    loadSessions()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages.filterNot { it.id == optimistic.id },
                        isSending = false,
                        error = result.message
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
