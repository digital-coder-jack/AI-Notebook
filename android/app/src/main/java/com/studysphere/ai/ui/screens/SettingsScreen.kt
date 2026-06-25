package com.studysphere.ai.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.studysphere.ai.data.model.Plan
import com.studysphere.ai.data.model.User
import com.studysphere.ai.ui.components.Avatar
import com.studysphere.ai.ui.components.ErrorBanner

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    user: User,
    plans: List<Plan>,
    isDarkTheme: Boolean,
    isSaving: Boolean,
    saved: Boolean,
    error: String?,
    onToggleTheme: (Boolean) -> Unit,
    onSave: (String, String) -> Unit,
    onLogout: () -> Unit,
    onBack: () -> Unit
) {
    var name by remember { mutableStateOf(user.name) }
    var selectedModelId by remember { mutableStateOf(user.defaultModelId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Profile section
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(name = user.name, colorHex = user.avatarColor, size = 48.dp)
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(user.name, fontWeight = FontWeight.SemiBold)
                            Text(user.email, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Appearance
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text("Dark mode", style = MaterialTheme.typography.titleMedium)
                    Switch(checked = isDarkTheme, onCheckedChange = onToggleTheme)
                }
            }

            Spacer(Modifier.height(16.dp))

            // Default model selection
            Text(
                "Default Model",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            plans.forEach { plan ->
                Text(
                    plan.name,
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
                plan.models.forEach { model ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .selectable(
                                selected = selectedModelId == model.id,
                                onClick = { selectedModelId = model.id }
                            )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp)
                        ) {
                            RadioButton(
                                selected = selectedModelId == model.id,
                                onClick = { selectedModelId = model.id }
                            )
                            Column(modifier = Modifier.padding(start = 4.dp)) {
                                Text(model.name, fontWeight = FontWeight.SemiBold)
                                Text(
                                    model.description,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            ErrorBanner(error)

            Spacer(Modifier.height(20.dp))
            Button(
                onClick = { onSave(name, selectedModelId) },
                enabled = !isSaving,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isSaving) "Saving…" else "Save changes")
            }
            if (saved) {
                Spacer(Modifier.height(8.dp))
                Text(
                    "Saved ✓",
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Log out")
            }
        }
    }
}
