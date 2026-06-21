# MindBoard — local setup

This is a real React web app (not an artifact preview), so it can make
actual network calls to Supabase. Run it locally to verify everything
works before deploying it publicly.

## Requirements

- Node.js installed on your computer (v18 or newer). Check with:
  `node --version`
  If you don't have it, download from https://nodejs.org

## Setup (one time)

1. Unzip this folder anywhere on your computer.
2. Open a terminal in that folder.
3. Run:
   ```
   npm install
   ```
   This downloads React, Vite, and the icon library. Takes 1-2 minutes.

## Run it

```
npm run dev
```

This starts a local server. Terminal will show something like:
```
Local:   http://localhost:5173/
```

Open that URL in your phone's browser or your computer's browser.
(For phone testing on the same WiFi: it will also show a "Network"
URL like `http://192.168.x.x:5173` — open that on your phone instead
of localhost.)

## What to test

1. Sign up with a real email — confirm you get a Supabase response
   (either logs you in directly, or shows "check your email" if
   email confirmation is on in your Supabase settings).
2. Sign in.
3. You should land on the book library — if you ran `schema.sql` and
   `schema_additions.sql` in Supabase already, you should see the
   5 seed books.
4. Tap a book → try Listen / Read / Workbook tabs.
5. Tap "Open mind map for this book" → try the canvas tools.
6. Log in as jayawantvipul@gmail.com to see the Admin button and
   manage books/questions.

## If something doesn't work

Open the browser's developer console (on Chrome: tap the three-dot
menu → "More tools" → "Developer tools" → "Console" tab, or on
desktop just press F12) and look for red error messages. Those will
tell us exactly what's failing — copy them back to Claude.

## Once this works locally

The natural next step is deploying this to Vercel so it has a real
public URL anyone can use from their phone, without needing Node.js
installed. Just say so once local testing looks good.
