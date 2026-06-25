package com.studysphere.ai.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.studysphere.ai.data.model.Plan
import com.studysphere.ai.data.model.User
import com.studysphere.ai.ui.components.ChatInputBar
import com.studysphere.ai.ui.components.ChatSidebar
import com.studysphere.ai.ui.components.EmptyChatPlaceholder
import com.studysphere.ai.ui.components.ErrorBanner
import com.studysphere.ai.ui.components.MessageBubble
import com.studysphere.ai.ui.components.ModelPickerDropdown
import com.studysphere.ai.ui.components.TypingIndicator
import com.studysphere.ai.viewmodel.ChatUiState
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    user: User?,
    state: ChatUiState,
    plans: List<Plan>,
    onSelectSession: (String) -> Unit,
    onNewChat: () -> Unit,
    onDeleteSession: (String) -> Unit,
    onSelectModel: (String) -> Unit,
    onSend: (String) -> Unit,
    onOpenSettings: () -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val activeTitle = state.sessions
        .firstOrNull { it.id == state.activeSessionId }?.title ?: "New Chat"

    LaunchedEffect(state.messages.size, state.isSending) {
        val count = state.messages.size + if (state.isSending) 1 else 0
        if (count > 0) {
            listState.animateScrollToItem(count - 1)
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(drawerContainerColor = MaterialTheme.colorScheme.surface) {
                ChatSidebar(
                    user = user,
                    sessions = state.sessions,
                    activeSessionId = state.activeSessionId,
                    onSelectSession = {
                        onSelectSession(it)
                        scope.launch { drawerState.close() }
                    },
                    onNewChat = {
                        onNewChat()
                        scope.launch { drawerState.close() }
                    },
                    onDeleteSession = onDeleteSession,
                    onOpenSettings = {
                        scope.launch { drawerState.close() }
                        onOpenSettings()
                    }
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            activeTitle,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    },
                    actions = {
                        ModelPickerDropdown(
                            plans = plans,
                            selectedModelId = state.selectedModelId,
                            onSelect = onSelectModel
                        )
                    }
                )
            },
            bottomBar = {
                ChatInputBar(enabled = !state.isSending, onSend = onSend)
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                ErrorBanner(state.error)
                if (state.messages.isEmpty() && !state.isSending) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        EmptyChatPlaceholder()
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp)
                    ) {
                        items(state.messages, key = { it.id }) { message ->
                            MessageBubble(message)
                        }
                        if (state.isSending) {
                            item(key = "typing") {
                                TypingIndicator()
                            }
                        }
                    }
                }
            }
        }
    }
}
