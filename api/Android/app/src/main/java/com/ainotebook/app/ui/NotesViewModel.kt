package com.ainotebook.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ainotebook.app.data.Repository
import com.ainotebook.app.data.SavedNote
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class NotesUiState(
    val notes: List<SavedNote> = emptyList(),
    val selectedId: Int? = null,
    val loading: Boolean = false,
    val saving: Boolean = false,
    val error: String? = null,
    val message: String? = null
)

class NotesViewModel(private val repo: Repository) : ViewModel() {
    private val _state = MutableStateFlow(NotesUiState(loading = true))
    val state: StateFlow<NotesUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            try {
                val notes = repo.listSavedNotes()
                _state.value = _state.value.copy(
                    notes = notes,
                    selectedId = _state.value.selectedId?.takeIf { id -> notes.any { it.id == id } },
                    loading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    loading = false,
                    error = e.message ?: "Could not load notes. Check your connection."
                )
            }
        }
    }

    fun select(id: Int?) {
        _state.value = _state.value.copy(selectedId = id, error = null, message = null)
    }

    fun create() {
        viewModelScope.launch {
            _state.value = _state.value.copy(saving = true, error = null, message = null)
            try {
                val note = repo.createSavedNote("Untitled note", "")
                _state.value = _state.value.copy(
                    notes = listOf(note) + _state.value.notes,
                    selectedId = note.id,
                    saving = false,
                    message = "Note created."
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(saving = false, error = e.message ?: "Could not create a note.")
            }
        }
    }

    fun save(id: Int, title: String, content: String) {
        if (title.isBlank()) {
            _state.value = _state.value.copy(error = "A note title is required.")
            return
        }
        viewModelScope.launch {
            _state.value = _state.value.copy(saving = true, error = null, message = null)
            try {
                val updated = repo.updateSavedNote(id, title.trim(), content)
                _state.value = _state.value.copy(
                    notes = _state.value.notes.map { if (it.id == id) updated else it },
                    saving = false,
                    message = "All changes saved."
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(saving = false, error = e.message ?: "Could not save note.")
            }
        }
    }

    fun delete(id: Int) {
        viewModelScope.launch {
            _state.value = _state.value.copy(saving = true, error = null, message = null)
            try {
                repo.deleteSavedNote(id)
                _state.value = _state.value.copy(
                    notes = _state.value.notes.filterNot { it.id == id },
                    selectedId = if (_state.value.selectedId == id) null else _state.value.selectedId,
                    saving = false,
                    message = "Note deleted."
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(saving = false, error = e.message ?: "Could not delete note.")
            }
        }
    }

    fun clearMessages() {
        _state.value = _state.value.copy(error = null, message = null)
    }
}
