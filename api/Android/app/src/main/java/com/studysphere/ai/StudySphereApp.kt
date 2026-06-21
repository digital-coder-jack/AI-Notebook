package com.studysphere.ai

import android.app.Application
import com.studysphere.ai.data.ApiClient
import com.studysphere.ai.data.Repository
import com.studysphere.ai.data.SessionStore

/**
 * Application class that wires up the singletons (session store, API client,
 * repository) used across the app.
 */
class StudySphereApp : Application() {

    lateinit var session: SessionStore
        private set
    lateinit var repository: Repository
        private set

    override fun onCreate() {
        super.onCreate()
        session = SessionStore(this)
        ApiClient.init(session)
        repository = Repository(session)
        instance = this
    }

    companion object {
        lateinit var instance: StudySphereApp
            private set
    }
}
