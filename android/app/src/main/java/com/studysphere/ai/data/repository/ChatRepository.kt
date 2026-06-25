package com.studysphere.ai.data.repository

import com.studysphere.ai.data.api.StudySphereApi
import com.studysphere.ai.data.model.ChatMessage
import com.studysphere.ai.data.model.ChatSession
import com.studysphere.ai.data.model.CreateSessionRequest
import com.studysphere.ai.data.model.SendMessageRequest
import com.studysphere.ai.data.model.toDomain
import com.studysphere.ai.data.storage.MessageDao
import com.studysphere.ai.data.storage.SessionDao
import com.studysphere.ai.data.storage.toDomain
import com.studysphere.ai.data.storage.toEntity
import com.studysphere.ai.utils.Resource
import com.studysphere.ai.utils.toUserMessage
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Chat repository with offline cache. Network results are persisted to
 * Room; if the network is unavailable, cached data is returned so the
 * app remains usable offline.
 */
@Singleton
class ChatRepository @Inject constructor(
    private val api: StudySphereApi,
    private val sessionDao: SessionDao,
    private val messageDao: MessageDao
) {
    suspend fun getSessions(): Resource<List<ChatSession>> {
        return try {
            val res = api.listSessions()
            val sessions = res.sessions.map { it.toDomain() }
            sessionDao.upsertAll(sessions.map { it.toEntity() })
            Resource.Success(sessions)
        } catch (e: Exception) {
            val cached = sessionDao.getAll().map { it.toDomain() }
            if (cached.isNotEmpty()) {
                Resource.Success(cached)
            } else {
                Resource.Error(e.toUserMessage())
            }
        }
    }

    suspend fun getMessages(sessionId: String): Resource<List<ChatMessage>> {
        return try {
            val res = api.getSession(sessionId)
            val messages = res.messages.map { it.toDomain() }
            messageDao.deleteForSession(sessionId)
            messageDao.upsertAll(messages.map { it.toEntity() })
            Resource.Success(messages)
        } catch (e: Exception) {
            val cached = messageDao.getForSession(sessionId).map { it.toDomain() }
            if (cached.isNotEmpty()) {
                Resource.Success(cached)
            } else {
                Resource.Error(e.toUserMessage())
            }
        }
    }

    suspend fun createSession(modelId: String): Resource<ChatSession> {
        return try {
            val res = api.createSession(CreateSessionRequest(modelId))
            val session = res.session.toDomain()
            sessionDao.upsert(session.toEntity())
            Resource.Success(session)
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }

    suspend fun deleteSession(sessionId: String): Resource<Unit> {
        return try {
            api.deleteSession(sessionId)
            sessionDao.deleteById(sessionId)
            messageDao.deleteForSession(sessionId)
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }

    suspend fun sendMessage(
        sessionId: String,
        content: String,
        modelId: String
    ): Resource<Pair<ChatMessage, ChatMessage>> {
        return try {
            val res = api.sendMessage(sessionId, SendMessageRequest(content, modelId))
            val userMessage = res.userMessage.toDomain()
            val assistantMessage = res.assistantMessage.toDomain()
            messageDao.upsert(userMessage.toEntity())
            messageDao.upsert(assistantMessage.toEntity())
            sessionDao.upsert(res.session.toDomain().toEntity())
            Resource.Success(userMessage to assistantMessage)
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }
}
