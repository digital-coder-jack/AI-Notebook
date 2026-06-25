package com.studysphere.ai

import com.studysphere.ai.data.model.MessageDto
import com.studysphere.ai.data.model.MessageRole
import com.studysphere.ai.data.model.ModelDto
import com.studysphere.ai.data.model.PlanDto
import com.studysphere.ai.data.model.toDomain
import com.studysphere.ai.ui.components.parseColor
import org.junit.Assert.assertEquals
import org.junit.Test

class DomainMappingTest {

    @Test
    fun messageDto_mapsAssistantRole() {
        val dto = MessageDto(
            id = "1",
            sessionId = "s1",
            role = "assistant",
            content = "Hello",
            modelId = "lite-swift",
            createdAt = "2024-01-01T00:00:00Z"
        )
        val domain = dto.toDomain()
        assertEquals(MessageRole.ASSISTANT, domain.role)
        assertEquals("Hello", domain.content)
    }

    @Test
    fun messageDto_mapsUserRole() {
        val dto = MessageDto(
            id = "2",
            sessionId = "s1",
            role = "user",
            content = "Hi",
            modelId = null,
            createdAt = "2024-01-01T00:00:00Z"
        )
        assertEquals(MessageRole.USER, dto.toDomain().role)
    }

    @Test
    fun planDto_mapsModels() {
        val plan = PlanDto(
            name = "Study Sphere Lite",
            tier = "lite",
            description = "desc",
            models = listOf(ModelDto("lite-swift", "Swift", "fast"))
        )
        val domain = plan.toDomain()
        assertEquals("Study Sphere Lite", domain.name)
        assertEquals(1, domain.models.size)
        assertEquals("Swift", domain.models.first().name)
    }

    @Test
    fun parseColor_handlesHexWithHash() {
        val color = parseColor("#FF0000")
        assertEquals(1f, color.red, 0.01f)
    }
}
