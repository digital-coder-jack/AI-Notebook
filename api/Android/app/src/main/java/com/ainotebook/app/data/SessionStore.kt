package com.ainotebook.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.io.IOException
import kotlinx.serialization.json.Json

private val Context.dataStore by preferencesDataStore(name = "ai_notebook_session")

/**
 * Persists the JWT token and the cached user profile using Jetpack DataStore.
 */
class SessionStore(private val context: Context) {

    companion object {
        private val TOKEN_KEY = stringPreferencesKey("ss_token")
        private val USER_KEY = stringPreferencesKey("ss_user")
        private val json = Json { ignoreUnknownKeys = true }
    }

    val tokenFlow: Flow<String?> = context.dataStore.data
        .catch { if (it is IOException) emit(androidx.datastore.preferences.core.emptyPreferences()) else throw it }
        .map { it[TOKEN_KEY] }

    val userFlow: Flow<User?> = context.dataStore.data
        .catch { if (it is IOException) emit(androidx.datastore.preferences.core.emptyPreferences()) else throw it }
        .map { prefs ->
            prefs[USER_KEY]?.let {
                runCatching { json.decodeFromString<User>(it) }.getOrNull()
            }
        }

    suspend fun token(): String? = try {
        context.dataStore.data.first()[TOKEN_KEY]
    } catch (e: IOException) {
        null
    }

    suspend fun save(token: String, user: User) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
            prefs[USER_KEY] = json.encodeToString(User.serializer(), user)
        }
    }

    suspend fun saveUser(user: User) {
        context.dataStore.edit { prefs ->
            prefs[USER_KEY] = json.encodeToString(User.serializer(), user)
        }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }
}
