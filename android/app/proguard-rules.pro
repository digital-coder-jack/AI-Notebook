# Retrofit / OkHttp / Gson
-keepattributes Signature
-keepattributes *Annotation*
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**

# Keep data models (Gson) used by Retrofit
-keep class com.studysphere.ai.data.model.** { *; }

# Hilt
-keep class dagger.hilt.** { *; }
-keep class * extends androidx.lifecycle.ViewModel
