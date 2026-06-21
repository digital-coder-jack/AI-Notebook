package com.studysphere.ai.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Brand palette (mirrors the web app's indigo / violet / cyan gradient look).
val Indigo = Color(0xFF6D7BFF)
val Violet = Color(0xFFA855F7)
val Cyan = Color(0xFF22D3EE)
val SpaceBg = Color(0xFF0B1020)
val SpaceSurface = Color(0xFF141A2E)
val SpaceCard = Color(0xFF1B2238)

private val DarkColors = darkColorScheme(
    primary = Indigo,
    onPrimary = Color.White,
    secondary = Violet,
    tertiary = Cyan,
    background = SpaceBg,
    onBackground = Color(0xFFE6E9F5),
    surface = SpaceSurface,
    onSurface = Color(0xFFE6E9F5),
    surfaceVariant = SpaceCard,
    onSurfaceVariant = Color(0xFFB6BEDC),
    outline = Color(0xFF2C3550)
)

private val LightColors = lightColorScheme(
    primary = Indigo,
    secondary = Violet,
    tertiary = Cyan,
    background = Color(0xFFF5F6FB),
    surface = Color.White,
    surfaceVariant = Color(0xFFEDEFF7)
)

@Composable
fun StudySphereTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colors,
        typography = Typography(),
        content = content
    )
}
