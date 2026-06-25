package com.studysphere.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studysphere.ai.data.model.Plan
import com.studysphere.ai.data.model.User
import com.studysphere.ai.data.repository.AuthRepository
import com.studysphere.ai.data.repository.ModelRepository
import com.studysphere.ai.data.storage.SessionManager
import com.studysphere.ai.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val plans: List<Plan> = emptyList(),
    val isSaving: Boolean = false,
    val saved: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val modelRepository: ModelRepository,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    val isDarkTheme: StateFlow<Boolean> = sessionManager.darkThemeFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = false
    )

    init {
        loadPlans()
    }

    private fun loadPlans() {
        viewModelScope.launch {
            when (val result = modelRepository.getCatalog()) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(plans = result.data)
                is Resource.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }

    fun setDarkTheme(enabled: Boolean) {
        viewModelScope.launch {
            sessionManager.setDarkTheme(enabled)
        }
    }

    fun saveProfile(name: String, defaultModelId: String, onSaved: (User) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, saved = false, error = null)
            when (val result = authRepository.updateProfile(name, defaultModelId)) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, saved = true)
                    onSaved(result.data)
                }
                is Resource.Error -> _uiState.value = _uiState.value.copy(
                    isSaving = false,
                    error = result.message
                )
            }
        }
    }

    fun clearSaved() {
        _uiState.value = _uiState.value.copy(saved = false)
    }
}
