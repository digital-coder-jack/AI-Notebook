package com.studysphere.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studysphere.ai.data.model.Plan
import com.studysphere.ai.data.repository.ModelRepository
import com.studysphere.ai.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ModelUiState(
    val isLoading: Boolean = true,
    val plans: List<Plan> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class ModelViewModel @Inject constructor(
    private val modelRepository: ModelRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ModelUiState())
    val uiState: StateFlow<ModelUiState> = _uiState.asStateFlow()

    init {
        loadCatalog()
    }

    fun loadCatalog() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = modelRepository.getCatalog()) {
                is Resource.Success -> _uiState.value = ModelUiState(
                    isLoading = false,
                    plans = result.data
                )
                is Resource.Error -> _uiState.value = ModelUiState(
                    isLoading = false,
                    error = result.message
                )
            }
        }
    }
}
