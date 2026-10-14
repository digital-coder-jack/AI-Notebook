package com.ainotebook.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
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
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ainotebook.app.ui.AuthViewModel
import com.ainotebook.app.ui.components.BrandLogo
import com.ainotebook.app.ui.components.ErrorBanner
import com.ainotebook.app.ui.components.SpaceBackground
import com.ainotebook.app.ui.components.rememberHaptics
import com.ainotebook.app.ui.theme.BrandBlue
import com.ainotebook.app.ui.theme.BrandOrange
import com.ainotebook.app.ui.theme.BrandPink
import com.ainotebook.app.ui.theme.BrandViolet
import com.ainotebook.app.ui.theme.HairlineOutline
import com.ainotebook.app.ui.theme.MutedText
import com.ainotebook.app.ui.theme.SpaceCard

@Composable
fun LoginScreen(vm: AuthViewModel, onLoggedIn: () -> Unit, onGoSignup: () -> Unit) {
    val state by vm.state.collectAsState()
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    val haptic = rememberHaptics()
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }
    val alpha by animateFloatAsState(if (visible) 1f else 0f, tween(400), label = "fade")
    if (state.success) onLoggedIn()

    SpaceBackground {
        Column(
            modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp).alpha(alpha),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(48.dp))
            Box(Modifier.size(88.dp).clip(RoundedCornerShape(26.dp)).background(Brush.linearGradient(listOf(BrandOrange, BrandPink, BrandViolet, BrandBlue))).border(2.dp, HairlineOutline.copy(alpha = 0.6f), RoundedCornerShape(26.dp)), contentAlignment = Alignment.Center) {
                BrandLogo(size = 58.dp)
            }
            Spacer(Modifier.height(20.dp))
            Text("AI Notebook", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Text("Your intelligent workspace", color = MutedText, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 4.dp), textAlign = TextAlign.Center)
            Spacer(Modifier.height(36.dp))
            AnimatedVisibility(visible = visible, enter = fadeIn(tween(500, delayMillis = 150)) + slideInVertically(tween(500, delayMillis = 150)) { it / 2 }) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    FeatureChip("AI Chat", BrandPink)
                    FeatureChip("Smart Notes", BrandViolet)
                    FeatureChip("Study Tools", BrandBlue)
                }
            }
            Spacer(Modifier.height(28.dp))
            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(SpaceCard).border(1.dp, HairlineOutline.copy(alpha = 0.7f), RoundedCornerShape(24.dp)).padding(24.dp)) {
                Column {
                    Text("Welcome back", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    Text("Sign in to continue", color = MutedText, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 2.dp, bottom = 16.dp))
                    ErrorBanner(state.error)
                    OutlinedTextField(value = identifier, onValueChange = { identifier = it; vm.clearError() }, label = { Text("Email or username") }, leadingIcon = { Icon(Icons.Default.Person, null, tint = MutedText) }, singleLine = true, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), shape = RoundedCornerShape(14.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = BrandViolet, unfocusedBorderColor = HairlineOutline))
                    Spacer(Modifier.height(12.dp))
                    OutlinedTextField(value = password, onValueChange = { password = it; vm.clearError() }, label = { Text("Password") }, leadingIcon = { Icon(Icons.Default.Lock, null, tint = MutedText) }, singleLine = true, modifier = Modifier.fillMaxWidth(), visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), trailingIcon = { IconButton({ showPassword = !showPassword }) { Icon(if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = if (showPassword) "Hide password" else "Show password", tint = MutedText) } }, shape = RoundedCornerShape(14.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = BrandViolet, unfocusedBorderColor = HairlineOutline))
                    Spacer(Modifier.height(20.dp))
                    GradientButton("Enter workspace", state.loading) { haptic(); vm.login(identifier, password) }
                    Spacer(Modifier.height(10.dp))
                    OutlinedButton(onClick = { haptic(); vm.guest() }, enabled = !state.loading, modifier = Modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.outlinedButtonColors(contentColor = MutedText)) { Text("Continue as guest") }
                    Spacer(Modifier.height(4.dp))
                    TextButton(onClick = onGoSignup, modifier = Modifier.fillMaxWidth()) { Text("Don't have an account? Create one", color = BrandViolet) }
                }
            }
            Spacer(Modifier.height(32.dp))
            Text("Private by design · Built for focused learning", color = MutedText, style = MaterialTheme.typography.labelSmall, textAlign = TextAlign.Center)
            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun GradientButton(text: String, loading: Boolean, onClick: () -> Unit) {
    Box(Modifier.fillMaxWidth().height(54.dp).clip(RoundedCornerShape(14.dp)).background(Brush.linearGradient(listOf(BrandOrange, BrandPink, BrandViolet, BrandBlue)))) {
        Button(onClick = onClick, enabled = !loading, modifier = Modifier.fillMaxSize(), colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, disabledContainerColor = Color.Transparent), elevation = null, shape = RoundedCornerShape(14.dp)) {
            if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp) else Text(text, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        }
    }
}

@Composable
private fun FeatureChip(label: String, color: Color) {
    Box(Modifier.clip(RoundedCornerShape(30.dp)).background(color.copy(alpha = 0.15f)).border(1.dp, color.copy(alpha = 0.35f), RoundedCornerShape(30.dp)).padding(horizontal = 12.dp, vertical = 7.dp)) {
        Text(label, color = color, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.SemiBold)
    }
}
