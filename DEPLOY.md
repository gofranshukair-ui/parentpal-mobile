# Deploying ParentPal for team testing

Share installable builds with your team in two steps: deploy the API, then build the mobile app with EAS.

## Overview

| Step | What | Result |
|------|------|--------|
| 1 | Deploy ParentPal API to Render | Public HTTPS URL (e.g. `https://parentpal-api.onrender.com`) |
| 2 | EAS Build (Android + iOS) | Shareable APK link + TestFlight for iOS |

---

## Step 1 — Deploy the API

The API lives in the sibling repo: `../Cursor_projects`.

### Option A: Render (recommended)

1. Push `Cursor_projects` to GitHub (if not already).
2. Open [Render Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance** → connect the repo.
3. Render reads [`render.yaml`](../Cursor_projects/render.yaml) and creates:
   - PostgreSQL database (`parentpal-db`)
   - Web service (`parentpal-api`) from the Dockerfile
4. In the **parentpal-api** service → **Environment**, set:
   - `JWT_SECRET_KEY` — long random string (32+ chars)
   - `OPENAI_API_KEY` — your OpenAI key (needed for guidance/embeddings)
5. Wait for deploy, then verify:
   ```bash
   curl https://YOUR-SERVICE.onrender.com/health
   ```
6. Seed the knowledge base (one-time, from your machine with DB tunnel or Render shell):
   ```bash
   cd ../Cursor_projects
   # Point POSTGRES_* at Render DB (use Render's "Connect" tab for credentials)
   alembic upgrade head
   python scripts/ingest_knowledge.py datasets/child_development_sample.jsonl
   python scripts/ingest_knowledge.py datasets/sos_guidance_sample.jsonl
   python scripts/ingest_knowledge.py datasets/sos_social_school.jsonl
   python scripts/generate_embeddings.py
   ```

> **Note:** Render free tier sleeps after inactivity. First request may take ~30s to wake up.

### Option B: Docker on any VPS

```bash
cd ../Cursor_projects
cp .env.example .env   # set production secrets
docker compose up -d --build
```

Use your server's public URL as `API_URL` in the steps below.

---

## Step 2 — Configure the mobile app

### Prerequisites

- [Expo account](https://expo.dev/signup) (free tier works)
- **Android:** nothing else — EAS gives you a download link
- **iOS TestFlight:** [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)

### One-time setup

```bash
cd mobile_app
npm install -g eas-cli    # or: npx eas-cli
eas login
eas init                  # links project to Expo, sets EAS project ID
```

### Set your API URL

After the API is live, update the placeholder in [`eas.json`](eas.json):

```json
"env": {
  "API_URL": "https://YOUR-ACTUAL-API.onrender.com"
}
```

Update it in the `preview`, `preview-testflight`, and `production` profiles.

Local dev still uses `http://127.0.0.1:8000` automatically (see [`app.config.ts`](app.config.ts)).

---

## Step 3 — Build for your team

### Android (APK — easiest to share)

```bash
eas build --platform android --profile preview
```

When the build finishes, EAS shows a **QR code and download URL**. Share that link with testers — they install the APK directly (may need "Install from unknown sources" enabled).

### iOS (TestFlight)

1. Create an app in [App Store Connect](https://appstoreconnect.apple.com).
2. Fill in Apple IDs in `eas.json` → `submit.preview-testflight.ios` (or pass flags on first submit).
3. Build and submit:

```bash
eas build --platform ios --profile preview-testflight
eas submit --platform ios --profile preview-testflight --latest
```

4. In App Store Connect → **TestFlight**, add testers by email. They install via the TestFlight app.

### Both platforms at once

```bash
eas build --platform all --profile preview
```

---

## Quick reference

| Command | Purpose |
|---------|---------|
| `eas build:list` | See past builds and install links |
| `eas build --platform android --profile preview` | Android APK for team |
| `eas build --platform ios --profile preview-testflight` | iOS build for TestFlight |
| `eas submit --platform ios --latest` | Upload latest iOS build to TestFlight |

---

## Troubleshooting

**App can't reach API**
- Confirm `API_URL` in `eas.json` matches your deployed API (HTTPS, no trailing slash).
- Rebuild after changing `API_URL` — it is baked in at build time.

**Login/register fails on team devices**
- API must be reachable from the internet.
- Check Render logs for 5xx errors.

**iOS build fails on credentials**
- Run `eas credentials` and follow prompts, or let EAS manage signing on first build.

**Expo Go vs dev build**
- Team testing should use **EAS preview builds**, not Expo Go — notifications and some native features require a standalone build.
