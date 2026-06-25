package com.studysphere.ai.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun LoadingScreen(message: String = "Loading...") {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    }
}

@Composable
fun Avatar(
    name: String,
    colorHex: String,
    size: Dp = 40.dp
) {
    val color = parseColor(colorHex)
    Surface(
        modifier = Modifier
            .size(size)
            .clip(CircleShape),
        color = color
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = name.take(1).uppercase(),
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun ErrorBanner(message: String?) {
    AnimatedVisibility(
        visible = message != null,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            color = MaterialTheme.colorScheme.errorContainer,
            shape = MaterialTheme.shapes.medium
        ) {
            Text(
                text = message ?: "",
                modifier = Modifier.padding(12.dp),
                color = MaterialTheme.colorScheme.onErrorContainer,
                textAlign = TextAlign.Center
            )
        }
    }
}

fun parseColor(hex: String): Color {
    return try {
        val clean = hex.removePrefix("#")
        val value = clean.toLong(16)
        when (clean.length) {
            6 -> Color(0xFF000000 or value)
            8 -> Color(value)
            else -> Color(0xFF5865F2)
        }
    } catch (e: Exception) {
        Color(0xFF5865F2)
    }
}
