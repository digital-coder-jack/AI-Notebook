package com.studysphere.ai.data.api

import com.studysphere.ai.data.model.AuthResponse
import com.studysphere.ai.data.model.CatalogResponse
import com.studysphere.ai.data.model.CreateSessionRequest
import com.studysphere.ai.data.model.CreateSessionResponse
import com.studysphere.ai.data.model.LoginRequest
import com.studysphere.ai.data.model.MeResponse
import com.studysphere.ai.data.model.RegisterRequest
import com.studysphere.ai.data.model.SendMessageRequest
import com.studysphere.ai.data.model.SendMessageResponse
import com.studysphere.ai.data.model.SessionDetailResponse
import com.studysphere.ai.data.model.SessionsResponse
import com.studysphere.ai.data.model.UpdateProfileRequest
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

/**
 * Retrofit definition of the backend API.
 * The app communicates ONLY with this backend; it never calls
 * AI providers directly and never holds provider API keys.
 */
interface StudySphereApi {

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @GET("auth/me")
    suspend fun me(): MeResponse

    @PATCH("auth/me")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): MeResponse

    @GET("models")
    suspend fun catalog(): CatalogResponse

    @GET("chat/sessions")
    suspend fun listSessions(): SessionsResponse

    @POST("chat/sessions")
    suspend fun createSession(@Body body: CreateSessionRequest): CreateSessionResponse

    @GET("chat/sessions/{id}")
    suspend fun getSession(@Path("id") id: String): SessionDetailResponse

    @DELETE("chat/sessions/{id}")
    suspend fun deleteSession(@Path("id") id: String)

    @POST("chat/sessions/{id}/messages")
    suspend fun sendMessage(
        @Path("id") id: String,
        @Body body: SendMessageRequest
    ): SendMessageResponse
}
