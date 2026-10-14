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
import com.ainotebook.app.data.AccentTone

val BrandOrange = Color(0xFFFF9547)
val BrandPink = Color(0xFFF053A0)
val BrandViolet = Color(0xFF9B5CF5)
val BrandBlue = Color(0xFF4B7BF5)
val Indigo = Color(0xFF9B5CF5)
val Violet = Color(0xFFE879F9)
val Cyan = Color(0xFF67E8F9)

val SpaceBg = Color.White
val SpaceSurface = Color.White
val SpaceCard = Color(0xFFF8F9FC)
val AssistantBubble = Color(0xFFF1F3F8)
val HairlineOutline = Color(0xFFE2E6EF)
val MutedText = Color(0xFF5E6675)
val LightBg = Color.White
val LightSurface = Color(0xFFFFFFFF)
val LightCard = Color(0xFFF8F9FC)
val LightHairline = Color(0xFFE2E6EF)
val LightMuted = Color(0xFF5E6675)

private val DarkColors = darkColorScheme(
    primary = BrandViolet,
    onPrimary = Color.White,
    primaryContainer = BrandViolet.copy(alpha = 0.22f),
    onPrimaryContainer = Color(0xFFE4D9FF),
    secondary = BrandPink,
    onSecondary = Color.White,
    secondaryContainer = BrandPink.copy(alpha = 0.18f),
    onSecondaryContainer = Color.White,
    tertiary = Cyan,
    onTertiary = Color(0xFF062A30),
    background = SpaceBg,
    onBackground = Color(0xFFEDEBFF),
    surface = SpaceSurface,
    onSurface = Color(0xFFEDEBFF),
    surfaceVariant = SpaceCard,
    onSurfaceVariant = MutedText,
    surfaceContainer = SpaceCard,
    surfaceContainerHigh = Color(0xFF231E3A),
    outline = HairlineOutline,
    outlineVariant = Color(0xFF1C1638),
    error = Color(0xFFFB7185),
    onError = Color.White
)

private val LightColors = lightColorScheme(
    primary = BrandViolet,
    onPrimary = Color.White,
    primaryContainer = BrandViolet.copy(alpha = 0.14f),
    onPrimaryContainer = Color(0xFF2A1F60),
    secondary = BrandPink,
    onSecondary = Color.White,
    secondaryContainer = BrandPink.copy(alpha = 0.12f),
    onSecondaryContainer = Color(0xFF2A0F20),
    tertiary = Cyan,
    onTertiary = Color(0xFF062A30),
    background = LightBg,
    onBackground = Color(0xFF130E26),
    surface = LightSurface,
    onSurface = Color(0xFF130E26),
    surfaceVariant = LightCard,
    onSurfaceVariant = LightMuted,
    surfaceContainer = LightCard,
    surfaceContainerHigh = Color(0xFFE4E0F6),
    outline = LightHairline,
    outlineVariant = Color(0xFFE0DCF2),
    error = Color(0xFFDC2626),
    onError = Color.White
)

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
        AccentTone.INDIGO -> BrandViolet
        AccentTone.CYAN -> Cyan
        AccentTone.VIOLET -> Violet
        AccentTone.SUNSET -> BrandOrange
    }
    return copy(
        primary = primary,
        primaryContainer = primary.copy(alpha = if (dark) 0.24f else 0.14f),
        onPrimaryContainer = if (dark) Color.White else Color(0xFF20143F),
        secondary = if (tone == AccentTone.SUNSET) BrandPink else primary,
        tertiary = if (tone == AccentTone.CYAN) BrandViolet else Cyan
    )
}
