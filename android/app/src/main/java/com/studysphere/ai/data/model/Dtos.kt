package com.studysphere.ai.data.model

import com.google.gson.annotations.SerializedName

/**
 * Data Transfer Objects mirroring the backend API contract.
 * These are shared in shape with the frontend TypeScript types.
 */

data class UserDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("avatarColor") val avatarColor: String,
    @SerializedName("defaultModelId") val defaultModelId: String,
    @SerializedName("createdAt") val createdAt: String
)

data class AuthResponse(
    @SerializedName("token") val token: String,
    @SerializedName("user") val user: UserDto
)

data class MeResponse(
    @SerializedName("user") val user: UserDto
)

data class RegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class UpdateProfileRequest(
    @SerializedName("name") val name: String? = null,
    @SerializedName("defaultModelId") val defaultModelId: String? = null
)

data class ModelDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String
)

data class PlanDto(
    @SerializedName("name") val name: String,
    @SerializedName("tier") val tier: String,
    @SerializedName("description") val description: String,
    @SerializedName("models") val models: List<ModelDto>
)

data class CatalogResponse(
    @SerializedName("plans") val plans: List<PlanDto>
)

data class SessionDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("modelId") val modelId: String,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

data class SessionsResponse(
    @SerializedName("sessions") val sessions: List<SessionDto>
)

data class CreateSessionResponse(
    @SerializedName("session") val session: SessionDto
)

data class MessageDto(
    @SerializedName("id") val id: String,
    @SerializedName("sessionId") val sessionId: String,
    @SerializedName("role") val role: String,
    @SerializedName("content") val content: String,
    @SerializedName("modelId") val modelId: String?,
    @SerializedName("createdAt") val createdAt: String
)

data class SessionDetailResponse(
    @SerializedName("session") val session: SessionDto,
    @SerializedName("messages") val messages: List<MessageDto>
)

data class CreateSessionRequest(
    @SerializedName("modelId") val modelId: String,
    @SerializedName("title") val title: String? = null
)

data class SendMessageRequest(
    @SerializedName("content") val content: String,
    @SerializedName("modelId") val modelId: String
)

data class SendMessageResponse(
    @SerializedName("userMessage") val userMessage: MessageDto,
    @SerializedName("assistantMessage") val assistantMessage: MessageDto,
    @SerializedName("session") val session: SessionDto
)
