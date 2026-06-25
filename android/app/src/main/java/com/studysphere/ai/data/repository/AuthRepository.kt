package com.studysphere.ai.data.repository

import com.studysphere.ai.data.api.StudySphereApi
import com.studysphere.ai.data.model.LoginRequest
import com.studysphere.ai.data.model.RegisterRequest
import com.studysphere.ai.data.model.UpdateProfileRequest
import com.studysphere.ai.data.model.User
import com.studysphere.ai.data.model.toDomain
import com.studysphere.ai.data.storage.SessionManager
import com.studysphere.ai.utils.Resource
import com.studysphere.ai.utils.toUserMessage
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: StudySphereApi,
    private val sessionManager: SessionManager
) {
    suspend fun register(name: String, email: String, password: String): Resource<User> {
        return try {
            val res = api.register(RegisterRequest(name, email, password))
            sessionManager.saveToken(res.token)
            Resource.Success(res.user.toDomain())
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }

    suspend fun login(email: String, password: String): Resource<User> {
        return try {
            val res = api.login(LoginRequest(email, password))
            sessionManager.saveToken(res.token)
            Resource.Success(res.user.toDomain())
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }

    suspend fun loadCurrentUser(): Resource<User> {
        return try {
            val res = api.me()
            Resource.Success(res.user.toDomain())
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }

    suspend fun updateProfile(name: String?, defaultModelId: String?): Resource<User> {
        return try {
            val res = api.updateProfile(UpdateProfileRequest(name, defaultModelId))
            Resource.Success(res.user.toDomain())
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }

    suspend fun logout() {
        sessionManager.clearToken()
    }

    suspend fun hasSession(): Boolean = !sessionManager.currentToken().isNullOrBlank()
}
