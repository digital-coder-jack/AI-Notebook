# Keep kotlinx.serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.studysphere.ai.**$$serializer { *; }
-keepclassmembers class com.studysphere.ai.** {
    *** Companion;
}
-keepclasseswithmembers class com.studysphere.ai.** {
    kotlinx.serialization.KSerializer serializer(...);
}
