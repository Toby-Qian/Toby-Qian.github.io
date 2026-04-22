# Waline Backend — Toby Qian Guestbook

This folder is a **separate** project you deploy to Vercel to power the
`#guestbook` section on the main site. It is NOT served by GitHub Pages.

## One-time setup (≈10 minutes)

### 1. Create a LeanCloud International app (free tier = database)

1. Sign up at https://leancloud.app (International, not the China site).
2. Create a new app → pick the free "Developer" plan.
3. Open the app → **Settings → App Keys** → copy these three:
   - `AppID` → will become env var `LEAN_ID`
   - `AppKey` → will become env var `LEAN_KEY`
   - `MasterKey` → will become env var `LEAN_MASTER_KEY`

### 2. Deploy this folder to Vercel

Option A — via Vercel CLI (runs from this folder):

```bash
cd waline
npx vercel          # first time: login + link to a new project
npx vercel --prod   # promote to production
```

Option B — via dashboard:

1. Push the whole `githubpersonal` repo to GitHub (already done).
2. Go to https://vercel.com/new → Import the repo.
3. Set **Root Directory** to `waline` (important!).
4. Framework preset: Other. Build command: empty. Output dir: empty.
5. Add the environment variables below **before** clicking Deploy.

### 3. Environment variables on Vercel

Settings → Environment Variables (scope: Production + Preview + Development):

| Key              | Value                                           |
| ---------------- | ----------------------------------------------- |
| `LEAN_ID`        | LeanCloud AppID                                 |
| `LEAN_KEY`       | LeanCloud AppKey                                |
| `LEAN_MASTER_KEY`| LeanCloud MasterKey                             |
| `SITE_NAME`      | `Toby Qian · Personal Press`                    |
| `SITE_URL`       | `https://toby-qian.github.io`                   |
| `SECURE_DOMAINS` | `toby-qian.github.io`                           |
| `AUTHOR_EMAIL`   | `q1509713692@gmail.com` (optional, marks owner) |

Redeploy after adding vars.

### 4. Wire the frontend

Once Vercel gives you a URL like `https://toby-qian-waline.vercel.app`:

1. Open `F:\codex\githubpersonal\index.html`.
2. Find the line `const WALINE_SERVER_URL = 'https://YOUR-WALINE-INSTANCE.vercel.app';`
3. Replace with your real URL.
4. Commit + push — GitHub Pages redeploys and the board goes live.

### 5. Register yourself as admin

1. Visit `https://<your-waline>.vercel.app/ui/register` once.
2. Use the `AUTHOR_EMAIL` above → your comments will show an owner badge.
3. Manage / delete messages at `https://<your-waline>.vercel.app/ui`.

## Docs

- Waline: https://waline.js.org/en/
- LeanCloud storage: https://waline.js.org/en/guide/database/leancloud.html
- Vercel deploy: https://waline.js.org/en/guide/deploy/vercel.html
