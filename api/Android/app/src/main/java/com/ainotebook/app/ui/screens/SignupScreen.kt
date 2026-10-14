package com.ainotebook.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
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
fun SignupScreen(vm: AuthViewModel, onSignedUp: () -> Unit, onGoLogin: () -> Unit) {
    val state by vm.state.collectAsState()
    var name by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    val haptic = rememberHaptics()
    if (state.success) onSignedUp()

    SpaceBackground {
        Column(Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(42.dp))
            BrandLogo(size = 72.dp)
            Spacer(Modifier.height(16.dp))
            Text("Create your workspace", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Text("A calmer place to learn, plan, and think.", color = MutedText, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 5.dp))
            Spacer(Modifier.height(28.dp))
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(SpaceCard).border(1.dp, HairlineOutline.copy(alpha = 0.7f), RoundedCornerShape(24.dp)).padding(22.dp), verticalArrangement = Arrangement.spacedBy(11.dp)) {
                ErrorBanner(state.error)
                SignupField("Full name", name, { name = it; vm.clearError() })
                SignupField("Username", username, { username = it; vm.clearError() })
                SignupField("Email", email, { email = it; vm.clearError() }, KeyboardType.Email)
                SignupField("Password (min 6)", password, { password = it; vm.clearError() }, KeyboardType.Password, true)
                SignupField("Confirm password", confirm, { confirm = it; vm.clearError() }, KeyboardType.Password, true)
                Spacer(Modifier.height(8.dp))
                BoxGradientButton("Create account", state.loading) { haptic(); vm.signup(name, username, email, password, confirm) }
                TextButton(onClick = onGoLogin, modifier = Modifier.fillMaxWidth()) { Text("Already have an account? Log in", color = BrandViolet) }
            }
            Spacer(Modifier.height(26.dp))
            Text("Your notes and conversations stay private.", color = MutedText, style = MaterialTheme.typography.labelSmall, textAlign = TextAlign.Center)
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun SignupField(label: String, value: String, onValueChange: (String) -> Unit, keyboardType: KeyboardType = KeyboardType.Text, password: Boolean = false) {
    OutlinedTextField(value = value, onValueChange = onValueChange, label = { Text(label) }, singleLine = true, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = keyboardType), visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None, shape = RoundedCornerShape(14.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = BrandViolet, unfocusedBorderColor = HairlineOutline))
}

@Composable
private fun BoxGradientButton(label: String, loading: Boolean, onClick: () -> Unit) {
    Box(Modifier.fillMaxWidth().height(54.dp).clip(RoundedCornerShape(14.dp)).background(Brush.linearGradient(listOf(BrandOrange, BrandPink, BrandViolet, BrandBlue)))) {
        Button(onClick = onClick, enabled = !loading, modifier = Modifier.fillMaxSize(), colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, disabledContainerColor = Color.Transparent), elevation = null, shape = RoundedCornerShape(14.dp)) {
            if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp) else Text(label, color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}
