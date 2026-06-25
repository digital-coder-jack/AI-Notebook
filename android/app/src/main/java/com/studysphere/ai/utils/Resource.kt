package com.studysphere.ai.utils

/**
 * A lightweight wrapper representing the result of an operation.
 */
sealed class Resource<out T> {
    data class Success<T>(val data: T) : Resource<T>()
    data class Error(val message: String) : Resource<Nothing>()
}

/**
 * Extracts a human-readable message from a throwable for UI display.
 */
fun Throwable.toUserMessage(): String {
    return when (this) {
        is retrofit2.HttpException -> {
            val body = response()?.errorBody()?.string()
            parseError(body) ?: "Request failed (${code()})"
        }
        is java.net.UnknownHostException,
        is java.net.ConnectException,
        is java.net.SocketTimeoutException -> "No internet connection."
        else -> message ?: "Something went wrong."
    }
}

private fun parseError(body: String?): String? {
    if (body.isNullOrBlank()) return null
    return try {
        val json = com.google.gson.JsonParser.parseString(body).asJsonObject
        if (json.has("error")) json.get("error").asString else null
    } catch (e: Exception) {
        null
    }
}
