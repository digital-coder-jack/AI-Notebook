package com.studysphere.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.studysphere.ai.ui.AppRoot
import com.studysphere.ai.ui.theme.StudySphereTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val repo = (application as StudySphereApp).repository
        setContent {
            StudySphereTheme(darkTheme = true) {
                AppRoot(repo)
            }
        }
    }
}
