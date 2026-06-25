package com.studysphere.ai.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.studysphere.ai.data.model.Plan

@Composable
fun ModelPickerDropdown(
    plans: List<Plan>,
    selectedModelId: String,
    onSelect: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    val current = plans
        .flatMap { plan -> plan.models.map { it to plan.name } }
        .firstOrNull { it.first.id == selectedModelId }

    val label = current?.let { "${it.second} · ${it.first.name}" } ?: "Select model"

    Box {
        TextButton(onClick = { expanded = true }) {
            Text(label)
            Icon(Icons.Default.ArrowDropDown, contentDescription = null)
        }
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            plans.forEach { plan ->
                Text(
                    text = plan.name,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
                plan.models.forEach { model ->
                    DropdownMenuItem(
                        text = {
                            Column {
                                Text(model.name, fontWeight = FontWeight.SemiBold)
                                Text(
                                    model.description,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        },
                        onClick = {
                            onSelect(model.id)
                            expanded = false
                        }
                    )
                }
            }
        }
    }
}
