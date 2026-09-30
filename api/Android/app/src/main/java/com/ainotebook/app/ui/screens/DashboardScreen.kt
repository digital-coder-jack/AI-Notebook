package com.ainotebook.app.ui.screens

import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Widgets
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ainotebook.app.data.Chat
import com.ainotebook.app.data.Stats
import com.ainotebook.app.ui.DashboardViewModel
import com.ainotebook.app.ui.components.BrandLogo
import com.ainotebook.app.ui.components.DashboardSkeleton
import com.ainotebook.app.ui.components.ErrorBanner
import com.ainotebook.app.ui.components.GlassCard
import com.ainotebook.app.ui.components.rememberHaptics
import com.ainotebook.app.ui.theme.Cyan
import com.ainotebook.app.ui.theme.Indigo
import com.ainotebook.app.ui.theme.MutedText
import com.ainotebook.app.ui.theme.Violet

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(vm: DashboardViewModel, userName: String, onOpenChat: (Int) -> Unit, onNewChat: () -> Unit, onOpenTools: () -> Unit) {
    val state by vm.state.collectAsState()
    val haptic = rememberHaptics()
    if (state.loading && state.stats == null) { DashboardSkeleton(Modifier.fillMaxSize()); return }
    val pull = rememberPullToRefreshState()
    if (pull.isRefreshing) LaunchedEffect(true) { haptic(); vm.load() }
    LaunchedEffect(state.loading) { if (!state.loading) pull.endRefresh() }

    Box(Modifier.fillMaxSize().nestedScroll(pull.nestedScrollConnection)) {
        LazyColumn(Modifier.fillMaxSize().padding(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            item { Header(userName) }
            item { ErrorBanner(state.error) }
            state.stats?.let { s ->
                item { Hero(s, onNewChat) }
                item { SectionTitle("Your workspace") }
                item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) { Metric("Chats", s.total_chats, Icons.AutoMirrored.Filled.Chat, Indigo, Modifier.weight(1f)); Metric("AI replies", s.ai_responses, Icons.Default.SmartToy, Cyan, Modifier.weight(1f)) } }
                item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) { Metric("Messages", s.total_messages, Icons.Default.Forum, Violet, Modifier.weight(1f)); Metric("Quizzes", s.quizzes, Icons.Default.Quiz, Cyan, Modifier.weight(1f)) } }
                item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) { Action("Ask AI", "New conversation", Icons.Default.SmartToy, Indigo, onNewChat, Modifier.weight(1f)); Action("Study tools", "Notes, quiz, plan", Icons.Default.AutoStories, Cyan, onOpenTools, Modifier.weight(1f)) } }
                item { SectionTitle("Recent workspace") }
                if (s.recent_chats.isEmpty()) item { EmptyCard(onNewChat) } else items(s.recent_chats) { Recent(it, onOpenChat) }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
        PullToRefreshContainer(state = pull, modifier = Modifier.align(Alignment.TopCenter))
    }
}

@Composable private fun Header(name: String) {
    Row(Modifier.fillMaxWidth().padding(top = 20.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(48.dp).clip(RoundedCornerShape(16.dp)).background(Brush.linearGradient(listOf(Indigo, Violet))), contentAlignment = Alignment.Center) { BrandLogo(32.dp) }
        Spacer(Modifier.width(12.dp)); Column(Modifier.weight(1f)) {
            Text("AI NOTEBOOK", color = Indigo, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
            Text(greeting(), color = MutedText, style = MaterialTheme.typography.bodySmall)
            Text(name.ifBlank { "Explorer" }, color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        Box(Modifier.size(38.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceContainerHigh), contentAlignment = Alignment.Center) { Icon(Icons.Default.AutoAwesome, null, tint = Cyan, modifier = Modifier.size(19.dp)) }
    }
}

@Composable private fun Hero(s: Stats, onClick: () -> Unit) {
    Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(Brush.linearGradient(listOf(Color(0xFF33205C), Color(0xFF171323)))).clickable(onClick = onClick).padding(20.dp)) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.Bolt, null, tint = Color(0xFFFDE68A), modifier = Modifier.size(20.dp)); Spacer(Modifier.width(8.dp)); Text("Your learning command center", color = Color.White, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium) }
            Spacer(Modifier.height(10.dp)); Text(if (s.total_chats == 0) "Start a focused chat and turn any question into a clear next step." else "You have ${s.total_chats} learning conversations. Keep building momentum.", color = Color.White.copy(alpha = .78f), style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(15.dp)); Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.clip(RoundedCornerShape(12.dp)).background(Color.White).padding(horizontal = 14.dp, vertical = 9.dp)) { Text("New conversation  →", color = Color(0xFF291749), fontWeight = FontWeight.Bold) }; Spacer(Modifier.width(12.dp)); Text("Groq ready", color = Cyan, style = MaterialTheme.typography.labelMedium) }
        }
    }
}

@Composable private fun Metric(label: String, value: Int, icon: ImageVector, accent: Color, modifier: Modifier) {
    GlassCard(modifier) { Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(38.dp).clip(RoundedCornerShape(12.dp)).background(accent.copy(alpha = .16f)), contentAlignment = Alignment.Center) { Icon(icon, null, tint = accent, modifier = Modifier.size(20.dp)) }; Spacer(Modifier.width(9.dp)); Column { val count by animateIntAsState(value, tween(700), label = label); Text(count.toString(), color = MaterialTheme.colorScheme.onSurface, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); Text(label, color = MutedText, style = MaterialTheme.typography.labelSmall) } } }
}

@Composable private fun Action(title: String, subtitle: String, icon: ImageVector, accent: Color, onClick: () -> Unit, modifier: Modifier) { GlassCard(modifier.clickable(onClick = onClick)) { Column(Modifier.padding(14.dp)) { Icon(icon, null, tint = accent, modifier = Modifier.size(22.dp)); Spacer(Modifier.height(10.dp)); Text(title, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold); Text(subtitle, color = MutedText, style = MaterialTheme.typography.labelSmall) } } }

@Composable private fun Recent(chat: Chat, onOpen: (Int) -> Unit) { GlassCard(Modifier.fillMaxWidth().clickable { onOpen(chat.id) }) { Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(38.dp).clip(RoundedCornerShape(12.dp)).background(Indigo.copy(alpha = .16f)), contentAlignment = Alignment.Center) { Icon(Icons.AutoMirrored.Filled.Chat, null, tint = Indigo, modifier = Modifier.size(19.dp)) }; Spacer(Modifier.width(12.dp)); Column(Modifier.weight(1f)) { Text(chat.title, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.SemiBold, maxLines = 1); chat.updated_at?.let { Text(it, color = MutedText, style = MaterialTheme.typography.labelSmall) } }; Text("›", color = MutedText, fontSize = 24.sp) } } }

@Composable private fun EmptyCard(onClick: () -> Unit) { GlassCard(Modifier.fillMaxWidth().clickable(onClick = onClick)) { Column(Modifier.fillMaxWidth().padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) { Icon(Icons.Default.Widgets, null, tint = Indigo, modifier = Modifier.size(28.dp)); Spacer(Modifier.height(8.dp)); Text("Your workspace is ready", color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold); Text("Start your first conversation to see it here.", color = MutedText, style = MaterialTheme.typography.bodySmall) } } }

@Composable private fun SectionTitle(text: String) { Text(text, color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold) }
private fun greeting() = when (java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)) { in 5..11 -> "Good morning"; in 12..17 -> "Good afternoon"; else -> "Good evening" }
