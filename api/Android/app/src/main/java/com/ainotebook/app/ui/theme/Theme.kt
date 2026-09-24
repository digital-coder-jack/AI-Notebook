package com.ainotebook.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat

// Brand palette shared with the Web workspace: calm indigo with restrained
// violet/cyan accents rather than high-intensity neon surfaces.
val Indigo = Color(0xFF8EA2FF)
val Violet = Color(0xFFB39DFF)
val Cyan = Color(0xFF5FD7DF)

// Deep, calm space backgrounds — tuned for a premium ChatGPT/Gemini/Perplexity
// assistant feel: near-black canvas with subtly elevated surfaces.
val SpaceBg = Color(0xFF070A12)
val SpaceSurface = Color(0xFF0E1420)
val SpaceCard = Color(0xFF141C2A)

// Additional assistant-UI tokens (used by chat bubbles, dividers, hints).
val AssistantBubble = Color(0xFF192437)
val HairlineOutline = Color(0xFF2A3850)
val MutedText = Color(0xFF9EABC0)

// Light-mode equivalents so chat/dashboard stay legible when the user opts in.
val LightBg = Color(0xFFF6F7FC)
val LightSurface = Color(0xFFFFFFFF)
val LightCard = Color(0xFFEFF1FA)
val LightHairline = Color(0xFFDDE1F0)
val LightMuted = Color(0xFF5B647F)

private val DarkColors = darkColorScheme(
    primary = Indigo,
    onPrimary = Color.White,
    primaryContainer = Indigo.copy(alpha = 0.22f),
    onPrimaryContainer = Color(0xFFD8DCFF),
    secondary = Violet,
    onSecondary = Color.White,
    tertiary = Cyan,
    onTertiary = Color(0xFF062A30),
    background = SpaceBg,
    onBackground = Color(0xFFEDEFFA),
    surface = SpaceSurface,
    onSurface = Color(0xFFEDEFFA),
    surfaceVariant = SpaceCard,
    onSurfaceVariant = MutedText,
    surfaceContainer = SpaceCard,
    surfaceContainerHigh = Color(0xFF1A2138),
    outline = HairlineOutline,
    outlineVariant = Color(0xFF1C2440),
    error = Color(0xFFFB7185),
    onError = Color.White
)

private val LightColors = lightColorScheme(
    primary = Indigo,
    onPrimary = Color.White,
    primaryContainer = Indigo.copy(alpha = 0.14f),
    onPrimaryContainer = Color(0xFF2A2F66),
    secondary = Violet,
    onSecondary = Color.White,
    tertiary = Cyan,
    onTertiary = Color(0xFF062A30),
    background = LightBg,
    onBackground = Color(0xFF131726),
    surface = LightSurface,
    onSurface = Color(0xFF131726),
    surfaceVariant = LightCard,
    onSurfaceVariant = LightMuted,
    surfaceContainer = LightCard,
    surfaceContainerHigh = Color(0xFFE7EAF6),
    outline = LightHairline,
    outlineVariant = Color(0xFFE2E5F2),
    error = Color(0xFFDC2626),
    onError = Color.White
)

// Slightly tighter, more confident type scale (assistant-app feel).
private val AppTypography = Typography().run {
    copy(
        displaySmall = displaySmall.copy(fontWeight = FontWeight.Bold, letterSpacing = (-0.6).sp),
        headlineMedium = headlineMedium.copy(fontWeight = FontWeight.Bold, letterSpacing = (-0.5).sp),
        headlineSmall = headlineSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = (-0.3).sp),
        titleLarge = titleLarge.copy(fontWeight = FontWeight.SemiBold),
        titleMedium = titleMedium.copy(fontWeight = FontWeight.SemiBold),
        bodyLarge = bodyLarge.copy(lineHeight = 24.sp),
        bodyMedium = bodyMedium.copy(lineHeight = 22.sp),
        labelLarge = labelLarge.copy(fontWeight = FontWeight.SemiBold)
    )
}

@Composable
fun AiNotebookTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val colors = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }

    // Keep the system bars edge-to-edge and pick legible icon tints for the
    // chosen scheme (premium native behaviour, never a "website" frame).
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.setDecorFitsSystemWindows(window, false)
            val lightIcons = colors.background.luminance() > 0.5f
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = lightIcons
            controller.isAppearanceLightNavigationBars = lightIcons
        }
    }

    MaterialTheme(
        colorScheme = colors,
        typography = AppTypography,
        content = content
    )
}
