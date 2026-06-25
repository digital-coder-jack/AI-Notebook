# Deployment Guide

## 1. Backend

The backend is a standard Express app and can be deployed to any Node host
(Render, Railway, Fly.io, a VM, etc.).

### Steps
1. Provision a Node 18+ environment.
2. Set environment variables (see `docs/ENVIRONMENT.md`).
3. Install and start:
   ```bash
   cd backend
   npm ci --omit=dev
   npm start
   ```
4. Expose port `8080` (or your `PORT`) behind HTTPS.
5. Verify: `GET https://<host>/api/health` → `{ "status": "ok" }`.

### Notes
- Set `CORS_ORIGINS` to include your deployed frontend origin.
- The default data store is in-memory. For persistence across restarts, swap
  `backend/src/store/dataStore.js` for a database implementation (the public
  function signatures define the contract).

---

## 2. Frontend (Vercel)

The web app is a Next.js 14 App Router project, ready for Vercel.

### Steps
1. Push this repository to GitHub.
2. In Vercel, **Import Project** and select the repo.
3. Set **Root Directory** to `frontend`.
4. Vercel auto-detects Next.js (`vercel.json` is included).
5. Add an Environment Variable:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://<your-backend-host>/api`
6. Deploy.

### Build configuration (`frontend/vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### Local production test
```bash
cd frontend
npm run build
npm start
```

---

## 3. Android

### Debug APK
```bash
cd android
./gradlew assembleDebug
# -> app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (unsigned)
```bash
cd android
./gradlew assembleRelease
# -> app/build/outputs/apk/release/app-release-unsigned.apk
```

### Signing a release build
1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore release.jks -keyalg RSA \
     -keysize 2048 -validity 10000 -alias studysphere
   ```
2. Create `android/keystore.properties`:
   ```
   storeFile=../release.jks
   storePassword=********
   keyAlias=studysphere
   keyPassword=********
   ```
3. Wire a `signingConfig` in `android/app/build.gradle.kts` reading those
   properties and attach it to the `release` build type.
4. Update `BuildConfig.API_BASE_URL` for `release` to your production backend.
5. Build a signed App Bundle for the Play Store:
   ```bash
   ./gradlew bundleRelease
   ```

---

## 4. CI/CD

Pushing to `main` (or opening a PR) triggers the workflows in
`.github/workflows/`:

- **backend.yml** — `npm ci` → lint → test
- **frontend.yml** — `npm ci` → lint → `next build`
- **android.yml** — lint → unit tests → debug APK → release APK (artifacts)

Each workflow fails the pipeline on compilation errors, lint violations,
missing dependencies or unresolved references.
