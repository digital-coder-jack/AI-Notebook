package com.studysphere.ai.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studysphere.ai.data.Repository
import com.studysphere.ai.data.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false
)

class AuthViewModel(private val repo: Repository) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    val userFlow = repo.userFlow

    fun clearError() {
        _state.value = _state.value.copy(error = null)
    }

    private fun run(block: suspend () -> User) {
        viewModelScope.launch {
            _state.value = AuthUiState(loading = true)
            try {
                block()
                _state.value = AuthUiState(success = true)
            } catch (e: Exception) {
                _state.value = AuthUiState(error = friendly(e))
            }
        }
    }

    fun login(identifier: String, password: String) {
        if (identifier.isBlank() || password.isBlank()) {
            _state.value = AuthUiState(error = "Please enter your email/username and password.")
            return
        }
        run { repo.login(identifier.trim(), password) }
    }

    fun signup(
        name: String, username: String, email: String,
        password: String, confirm: String
    ) {
        when {
            name.isBlank() || username.isBlank() || email.isBlank() ->
                _state.value = AuthUiState(error = "Please fill in all fields.")
            password.length < 6 ->
                _state.value = AuthUiState(error = "Password must be at least 6 characters.")
            password != confirm ->
                _state.value = AuthUiState(error = "Passwords do not match.")
            else -> run {
                repo.signup(name.trim(), username.trim(), email.trim(), password, confirm)
            }
        }
    }

    fun guest() = run { repo.guest() }

    private fun friendly(e: Exception): String {
        val msg = e.message ?: "Something went wrong."
        return when {
            msg.contains("Unable to resolve host", true) ||
                msg.contains("timeout", true) ||
                msg.contains("failed to connect", true) ->
                "Cannot reach the server. Check your connection or the API URL."
            msg.contains("401") -> "Invalid credentials."
            msg.contains("409") -> "That account already exists."
            else -> msg
        }
    }
}
