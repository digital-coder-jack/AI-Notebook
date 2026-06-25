package com.studysphere.ai.data.repository

import com.studysphere.ai.data.api.StudySphereApi
import com.studysphere.ai.data.model.Plan
import com.studysphere.ai.data.model.toDomain
import com.studysphere.ai.utils.Resource
import com.studysphere.ai.utils.toUserMessage
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ModelRepository @Inject constructor(
    private val api: StudySphereApi
) {
    suspend fun getCatalog(): Resource<List<Plan>> {
        return try {
            val res = api.catalog()
            Resource.Success(res.plans.map { it.toDomain() })
        } catch (e: Exception) {
            Resource.Error(e.toUserMessage())
        }
    }
}
