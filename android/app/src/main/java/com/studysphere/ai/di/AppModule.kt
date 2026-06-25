package com.studysphere.ai.di

import android.content.Context
import androidx.room.Room
import com.studysphere.ai.BuildConfig
import com.studysphere.ai.data.api.AuthInterceptor
import com.studysphere.ai.data.api.StudySphereApi
import com.studysphere.ai.data.storage.MessageDao
import com.studysphere.ai.data.storage.SessionDao
import com.studysphere.ai.data.storage.SessionManager
import com.studysphere.ai.data.storage.StudySphereDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideSessionManager(@ApplicationContext context: Context): SessionManager =
        SessionManager(context)

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    @Provides
    @Singleton
    fun provideApi(retrofit: Retrofit): StudySphereApi =
        retrofit.create(StudySphereApi::class.java)

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): StudySphereDatabase =
        Room.databaseBuilder(
            context,
            StudySphereDatabase::class.java,
            "study_sphere.db"
        ).fallbackToDestructiveMigration().build()

    @Provides
    @Singleton
    fun provideSessionDao(db: StudySphereDatabase): SessionDao = db.sessionDao()

    @Provides
    @Singleton
    fun provideMessageDao(db: StudySphereDatabase): MessageDao = db.messageDao()
}
