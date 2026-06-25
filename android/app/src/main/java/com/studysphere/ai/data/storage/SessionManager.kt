package com.studysphere.ai.data.storage

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "study_sphere_prefs")

/**
 * Persists the auth token and user preferences (theme) across launches.
 * Provider API keys are never stored anywhere on the device.
 */
@Singleton
class SessionManager @Inject constructor(
    private val context: Context
) {
    private object Keys {
        val TOKEN = stringPreferencesKey("auth_token")
        val DARK_THEME = booleanPreferencesKey("dark_theme")
    }

    val tokenFlow: Flow<String?> = context.dataStore.data.map { it[Keys.TOKEN] }

    val darkThemeFlow: Flow<Boolean> = context.dataStore.data.map { it[Keys.DARK_THEME] ?: false }

    suspend fun currentToken(): String? = context.dataStore.data.first()[Keys.TOKEN]

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[Keys.TOKEN] = token }
    }

    suspend fun clearToken() {
        context.dataStore.edit { it.remove(Keys.TOKEN) }
    }

    suspend fun setDarkTheme(enabled: Boolean) {
        context.dataStore.edit { it[Keys.DARK_THEME] = enabled }
    }
}
