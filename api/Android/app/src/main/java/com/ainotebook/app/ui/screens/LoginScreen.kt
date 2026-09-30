package com.ainotebook.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ainotebook.app.ui.AuthViewModel
import com.ainotebook.app.ui.components.BrandLogo
import com.ainotebook.app.ui.components.ErrorBanner
import com.ainotebook.app.ui.components.GlassCard
import com.ainotebook.app.ui.components.SpaceBackground
import com.ainotebook.app.ui.components.rememberHaptics
import com.ainotebook.app.ui.theme.Cyan
import com.ainotebook.app.ui.theme.Indigo
import com.ainotebook.app.ui.theme.MutedText
import com.ainotebook.app.ui.theme.Violet

@Composable
fun LoginScreen(vm: AuthViewModel, onLoggedIn: () -> Unit, onGoSignup: () -> Unit) {
    val state by vm.state.collectAsState(); var identifier by remember { mutableStateOf("") }; var password by remember { mutableStateOf("") }; var showPassword by remember { mutableStateOf(false) }; val haptic = rememberHaptics()
    if (state.success) onLoggedIn()
    SpaceBackground {
        Column(Modifier.fillMaxSize().statusBarsPadding().verticalScroll(rememberScrollState()).padding(horizontal = 22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(40.dp))
            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(Brush.linearGradient(listOf(Color(0xFF301C56), Color(0xFF15121F)))).padding(22.dp)) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(52.dp).clip(RoundedCornerShape(17.dp)).background(Brush.linearGradient(listOf(Indigo, Violet))), contentAlignment = Alignment.Center) { BrandLogo(36.dp) }; Spacer(Modifier.width(13.dp)); Column { Text("AI NOTEBOOK", color = Color.White, fontWeight = FontWeight.Bold, letterSpacing = 1.6.sp); Text("Your learning command center", color = Color.White.copy(alpha = .68f), style = MaterialTheme.typography.bodySmall) } }
                    Spacer(Modifier.height(25.dp)); Text("Learn with clarity.", color = Color.White, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Text("Chat, organize, and build momentum in one focused workspace.", color = Color.White.copy(alpha = .75f), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 6.dp)); Spacer(Modifier.height(17.dp)); Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Pill("Groq ready", Cyan); Pill("Study tools", Violet) }
                }
            }
            Spacer(Modifier.height(18.dp)); GlassCard(Modifier.fillMaxWidth()) { Column(Modifier.padding(20.dp)) {
                Text("Welcome back", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface); Text("Sign in to continue your workspace", color = MutedText, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 3.dp, bottom = 16.dp)); ErrorBanner(state.error)
                OutlinedTextField(identifier, { identifier = it; vm.clearError() }, label = { Text("Email or username") }, singleLine = true, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), shape = RoundedCornerShape(15.dp)); Spacer(Modifier.height(11.dp))
                OutlinedTextField(password, { password = it; vm.clearError() }, label = { Text("Password") }, singleLine = true, modifier = Modifier.fillMaxWidth(), visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), trailingIcon = { IconButton({ showPassword = !showPassword }) { Icon(if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility, null) } }, shape = RoundedCornerShape(15.dp)); Spacer(Modifier.height(16.dp))
                Button({ haptic(); vm.login(identifier, password) }, enabled = !state.loading, modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(15.dp), colors = ButtonDefaults.buttonColors(containerColor = Indigo)) { if (state.loading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp) else Text("Enter workspace", fontWeight = FontWeight.Bold) }
                Spacer(Modifier.height(9.dp)); OutlinedButton({ haptic(); vm.guest() }, enabled = !state.loading, modifier = Modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(15.dp)) { Text("Continue as guest") }; Spacer(Modifier.height(4.dp)); TextButton(onGoSignup, Modifier.fillMaxWidth()) { Text("Create a new account") }
            } }
            Spacer(Modifier.height(24.dp)); Text("Private by design · Built for focused learning", color = MutedText, style = MaterialTheme.typography.labelSmall); Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable private fun Pill(text: String, color: Color) { Row(Modifier.clip(RoundedCornerShape(30.dp)).background(color.copy(alpha = .16f)).padding(horizontal = 10.dp, vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) { Icon(if (text.startsWith("Groq")) Icons.Default.AutoAwesome else Icons.Default.CheckCircle, null, tint = color, modifier = Modifier.size(14.dp)); Spacer(Modifier.width(5.dp)); Text(text, color = Color.White.copy(alpha = .9f), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.SemiBold) } }
