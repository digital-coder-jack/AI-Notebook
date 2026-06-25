package com.studysphere.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studysphere.ai.data.model.User
import com.studysphere.ai.data.repository.AuthRepository
import com.studysphere.ai.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val isCheckingSession: Boolean = true,
    val user: User? = null,
    val error: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        restoreSession()
    }

    private fun restoreSession() {
        viewModelScope.launch {
            if (authRepository.hasSession()) {
                when (val result = authRepository.loadCurrentUser()) {
                    is Resource.Success -> _uiState.value = _uiState.value.copy(
                        user = result.data,
                        isCheckingSession = false
                    )
                    is Resource.Error -> {
                        authRepository.logout()
                        _uiState.value = _uiState.value.copy(isCheckingSession = false)
                    }
                }
            } else {
                _uiState.value = _uiState.value.copy(isCheckingSession = false)
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = authRepository.login(email.trim(), password)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    user = result.data
                )
                is Resource.Error -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.message
                )
            }
        }
    }

    fun register(name: String, email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = authRepository.register(name.trim(), email.trim(), password)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    user = result.data
                )
                is Resource.Error -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.message
                )
            }
        }
    }

    fun updateUser(user: User) {
        _uiState.value = _uiState.value.copy(user = user)
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState(isCheckingSession = false)
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
