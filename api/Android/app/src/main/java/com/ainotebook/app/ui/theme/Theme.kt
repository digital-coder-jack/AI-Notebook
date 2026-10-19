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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import com.ainotebook.app.data.AccentTone

val NotelyIndigo = Color(0xFF5759B2)
val NotelyInk = Color(0xFF303340)
val NotelyMuted = Color(0xFF7D8088)
val NotelyBackground = Color(0xFFF5F4EF)
val NotelySurface = Color(0xFFFFFDF8)
val NotelyLavender = Color(0xFFEBEBFA)
val NotelyLine = Color(0xFFE3E0D8)
val NotelyGreen = Color(0xFF467866)
val NotelyAmber = Color(0xFFB27A21)

val BrandOrange = Color(0xFFB27A21)
val BrandPink = Color(0xFF9B5D72)
val BrandViolet = NotelyIndigo
val BrandBlue = NotelyIndigo
val Indigo = NotelyIndigo
val Violet = Color(0xFF7A78C7)
val Cyan = Color(0xFF467866)

val SpaceBg = NotelyBackground
val SpaceSurface = NotelySurface
val SpaceCard = NotelyLavender
val AssistantBubble = NotelyLavender
val HairlineOutline = NotelyLine
val MutedText = NotelyMuted
val LightBg = NotelyBackground
val LightSurface = NotelySurface
val LightCard = NotelyLavender
val LightHairline = NotelyLine
val LightMuted = NotelyMuted

private val DarkColors = darkColorScheme(
    primary = NotelyIndigo,
    onPrimary = Color.White,
    primaryContainer = NotelyIndigo.copy(alpha = 0.22f),
    onPrimaryContainer = Color.White,
    secondary = NotelyGreen,
    onSecondary = Color.White,
    tertiary = NotelyAmber,
    onTertiary = Color.White,
    background = Color(0xFF252522),
    onBackground = Color(0xFFF7F4EE),
    surface = Color(0xFF2D2D29),
    onSurface = Color(0xFFF7F4EE),
    surfaceVariant = Color(0xFF3A3A35),
    onSurfaceVariant = Color(0xFFD0CEC5),
    outline = Color(0xFF56564F),
    error = Color(0xFFD66C6C),
    onError = Color.White
)

private val LightColors = lightColorScheme(
    primary = NotelyIndigo,
    onPrimary = Color.White,
    primaryContainer = NotelyLavender,
    onPrimaryContainer = NotelyInk,
    secondary = NotelyGreen,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE9F1EC),
    onSecondaryContainer = NotelyInk,
    tertiary = NotelyAmber,
    onTertiary = Color.White,
    background = NotelyBackground,
    onBackground = NotelyInk,
    surface = NotelySurface,
    onSurface = NotelyInk,
    surfaceVariant = NotelyLavender,
    onSurfaceVariant = NotelyMuted,
    outline = NotelyLine,
    outlineVariant = NotelyLine,
    error = Color(0xFFB34848),
    onError = Color.White
)

private val AppTypography = Typography().run {
    copy(
        displaySmall = displaySmall.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Normal, letterSpacing = (-0.6).sp),
        headlineLarge = headlineLarge.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Normal),
        headlineMedium = headlineMedium.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Normal, letterSpacing = (-0.5).sp),
        headlineSmall = headlineSmall.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Normal, letterSpacing = (-0.3).sp),
        titleLarge = titleLarge.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Normal),
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
    accentTone: AccentTone = AccentTone.INDIGO,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val colors = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors.withAccent(accentTone, dark = true)
        else -> LightColors.withAccent(accentTone, dark = false)
    }
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
    MaterialTheme(colorScheme = colors, typography = AppTypography, content = content)
}

private fun androidx.compose.material3.ColorScheme.withAccent(
    tone: AccentTone,
    dark: Boolean
): androidx.compose.material3.ColorScheme {
    val primary = when (tone) {
        AccentTone.INDIGO -> NotelyIndigo
        AccentTone.CYAN -> NotelyGreen
        AccentTone.VIOLET -> NotelyIndigo
        AccentTone.SUNSET -> NotelyAmber
    }
    return copy(
        primary = primary,
        primaryContainer = primary.copy(alpha = if (dark) 0.24f else 0.14f),
        onPrimaryContainer = if (dark) Color.White else NotelyInk,
        secondary = if (tone == AccentTone.SUNSET) BrandPink else NotelyGreen,
        tertiary = NotelyAmber
    )
}
