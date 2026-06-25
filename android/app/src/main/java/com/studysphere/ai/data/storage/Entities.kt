package com.studysphere.ai.data.storage

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.studysphere.ai.data.model.ChatMessage
import com.studysphere.ai.data.model.ChatSession
import com.studysphere.ai.data.model.MessageRole

/** Room entity caching chat sessions for offline access. */
@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey val id: String,
    val title: String,
    val modelId: String,
    val updatedAt: String
)

/** Room entity caching chat messages for offline access. */
@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey val id: String,
    val sessionId: String,
    val role: String,
    val content: String,
    val modelId: String?,
    val createdAt: String
)

fun SessionEntity.toDomain() = ChatSession(
    id = id,
    title = title,
    modelId = modelId,
    updatedAt = updatedAt
)

fun ChatSession.toEntity() = SessionEntity(
    id = id,
    title = title,
    modelId = modelId,
    updatedAt = updatedAt
)

fun MessageEntity.toDomain() = ChatMessage(
    id = id,
    sessionId = sessionId,
    role = if (role == "assistant") MessageRole.ASSISTANT else MessageRole.USER,
    content = content,
    modelId = modelId,
    createdAt = createdAt
)

fun ChatMessage.toEntity() = MessageEntity(
    id = id,
    sessionId = sessionId,
    role = if (role == MessageRole.ASSISTANT) "assistant" else "user",
    content = content,
    modelId = modelId,
    createdAt = createdAt
)
