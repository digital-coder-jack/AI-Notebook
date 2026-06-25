package com.studysphere.ai.data.model

/**
 * Domain models used by the UI / ViewModels.
 * Decoupled from network DTOs and Room entities.
 */

data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatarColor: String,
    val defaultModelId: String
)

data class AiModel(
    val id: String,
    val name: String,
    val description: String
)

data class Plan(
    val name: String,
    val tier: String,
    val description: String,
    val models: List<AiModel>
)

data class ChatSession(
    val id: String,
    val title: String,
    val modelId: String,
    val updatedAt: String
)

enum class MessageRole { USER, ASSISTANT }

data class ChatMessage(
    val id: String,
    val sessionId: String,
    val role: MessageRole,
    val content: String,
    val modelId: String?,
    val createdAt: String
)

fun UserDto.toDomain() = User(
    id = id,
    name = name,
    email = email,
    avatarColor = avatarColor,
    defaultModelId = defaultModelId
)

fun ModelDto.toDomain() = AiModel(id = id, name = name, description = description)

fun PlanDto.toDomain() = Plan(
    name = name,
    tier = tier,
    description = description,
    models = models.map { it.toDomain() }
)

fun SessionDto.toDomain() = ChatSession(
    id = id,
    title = title,
    modelId = modelId,
    updatedAt = updatedAt
)

fun MessageDto.toDomain() = ChatMessage(
    id = id,
    sessionId = sessionId,
    role = if (role == "assistant") MessageRole.ASSISTANT else MessageRole.USER,
    content = content,
    modelId = modelId,
    createdAt = createdAt
)
