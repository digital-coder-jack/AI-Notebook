package com.studysphere.ai.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.studysphere.ai.ui.components.LoadingScreen
import com.studysphere.ai.ui.screens.ChatScreen
import com.studysphere.ai.ui.screens.LoginScreen
import com.studysphere.ai.ui.screens.ModelSelectionScreen
import com.studysphere.ai.ui.screens.RegisterScreen
import com.studysphere.ai.ui.screens.SettingsScreen
import com.studysphere.ai.viewmodel.AuthViewModel
import com.studysphere.ai.viewmodel.ChatViewModel
import com.studysphere.ai.viewmodel.ModelViewModel
import com.studysphere.ai.viewmodel.SettingsViewModel

@Composable
fun StudySphereNavGraph(
    authViewModel: AuthViewModel,
    navController: NavHostController = rememberNavController()
) {
    val authState by authViewModel.uiState.collectAsState()

    if (authState.isCheckingSession) {
        LoadingScreen()
        return
    }

    val startDestination = if (authState.user != null) Routes.CHAT else Routes.LOGIN

    NavHost(navController = navController, startDestination = startDestination) {

        composable(Routes.LOGIN) {
            LoginScreen(
                state = authState,
                onLogin = authViewModel::login,
                onNavigateToRegister = { navController.navigate(Routes.REGISTER) }
            )
            LaunchedEffect(authState.user) {
                if (authState.user != null) {
                    navController.navigate(Routes.CHAT) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            }
        }

        composable(Routes.REGISTER) {
            RegisterScreen(
                state = authState,
                onRegister = authViewModel::register,
                onNavigateToLogin = { navController.popBackStack() }
            )
            LaunchedEffect(authState.user) {
                if (authState.user != null) {
                    navController.navigate(Routes.CHAT) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            }
        }

        composable(Routes.CHAT) {
            val chatViewModel: ChatViewModel = hiltViewModel()
            val modelViewModel: ModelViewModel = hiltViewModel()
            val chatState by chatViewModel.uiState.collectAsState()
            val modelState by modelViewModel.uiState.collectAsState()
            val user = authState.user

            LaunchedEffect(user) {
                user?.let { chatViewModel.initialize(it.defaultModelId) }
            }

            // Guard: if logged out, return to login.
            LaunchedEffect(user) {
                if (user == null) {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.CHAT) { inclusive = true }
                    }
                }
            }

            ChatScreen(
                user = user,
                state = chatState,
                plans = modelState.plans,
                onSelectSession = chatViewModel::selectSession,
                onNewChat = chatViewModel::newChat,
                onDeleteSession = chatViewModel::deleteSession,
                onSelectModel = chatViewModel::selectModel,
                onSend = chatViewModel::sendMessage,
                onOpenSettings = { navController.navigate(Routes.SETTINGS) }
            )
        }

        composable(Routes.SETTINGS) {
            val settingsViewModel: SettingsViewModel = hiltViewModel()
            val settingsState by settingsViewModel.uiState.collectAsState()
            val isDark by settingsViewModel.isDarkTheme.collectAsState()
            val user = authState.user

            if (user == null) {
                LaunchedEffect(Unit) { navController.popBackStack() }
                return@composable
            }

            SettingsScreen(
                user = user,
                plans = settingsState.plans,
                isDarkTheme = isDark,
                isSaving = settingsState.isSaving,
                saved = settingsState.saved,
                error = settingsState.error,
                onToggleTheme = settingsViewModel::setDarkTheme,
                onSave = { name, modelId ->
                    settingsViewModel.saveProfile(name, modelId) { updated ->
                        authViewModel.updateUser(updated)
                    }
                },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.MODEL_SELECTION) {
            val modelViewModel: ModelViewModel = hiltViewModel()
            val modelState by modelViewModel.uiState.collectAsState()
            ModelSelectionScreen(
                plans = modelState.plans,
                isLoading = modelState.isLoading,
                error = modelState.error,
                selectedModelId = authState.user?.defaultModelId ?: "lite-swift",
                onSelect = { /* selection handled within chat/settings */ },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
