package com.studysphere.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.studysphere.ai.ui.ProfileViewModel
import com.studysphere.ai.ui.components.ErrorBanner
import com.studysphere.ai.ui.components.GlassCard
import com.studysphere.ai.ui.theme.Indigo
import com.studysphere.ai.ui.theme.Violet

@Composable
fun ProfileScreen(
    vm: ProfileViewModel,
    onLoggedOut: () -> Unit
) {
    val state by vm.state.collectAsState()
    var name by remember(state.user?.id) { mutableStateOf(state.user?.name ?: "") }
    var currentPw by remember { mutableStateOf("") }
    var newPw by remember { mutableStateOf("") }

    LaunchedEffect(state.loggedOut) {
        if (state.loggedOut) onLoggedOut()
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Header / avatar
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    Modifier
                        .size(84.dp)
                        .background(Indigo, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        (state.user?.name?.firstOrNull() ?: 'U').uppercase(),
                        color = Color.White,
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.height(10.dp))
                Text(
                    state.user?.name ?: "User",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    state.user?.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (state.user?.is_guest == true) {
                    Text("Guest account", color = Violet, style = MaterialTheme.typography.labelMedium)
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        ErrorBanner(state.error)
        state.message?.let {
            Text(it, color = MaterialTheme.colorScheme.tertiary, modifier = Modifier.padding(vertical = 6.dp))
        }

        // Edit name
        GlassCard(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("Display name", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    singleLine = true, modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = { vm.updateName(name) },
                    enabled = !state.loading,
                    colors = ButtonDefaults.buttonColors(containerColor = Indigo)
                ) { Text("Save name") }
            }
        }

        Spacer(Modifier.height(14.dp))

        // Change password
        GlassCard(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("Change password", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = currentPw, onValueChange = { currentPw = it },
                    label = { Text("Current password") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = newPw, onValueChange = { newPw = it },
                    label = { Text("New password") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = { vm.changePassword(currentPw, newPw); currentPw = ""; newPw = "" },
                    enabled = !state.loading,
                    colors = ButtonDefaults.buttonColors(containerColor = Violet)
                ) { Text("Update password") }
            }
        }

        Spacer(Modifier.height(20.dp))
        OutlinedButton(
            onClick = { vm.logout() },
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) { Text("Log out") }
        Spacer(Modifier.height(24.dp))
    }
}
