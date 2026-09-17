# llamafile.chat

A small Next.js chat UI for talking to a [llamafile](https://github.com/mozilla-ai/llamafile)
server — the single-file, no-install way to run local LLMs from Mozilla.ai.

This app is **just the front end**. llamafile itself is a local executable, not
a website, so it can't be "deployed to Vercel" — instead, this chat interface
talks to a llamafile server over its built-in OpenAI-compatible API, and
*this UI* is what gets deployed.

## How it fits together

```
 your browser  →  this Next.js app  →  your running llamafile
 (chat UI)        (proxies requests)    (does the actual inference)
```

The app never calls your llamafile server directly from the browser — it
proxies through a server-side API route (`/api/chat`). That avoids CORS
issues and keeps your llamafile server's address out of client-side code.

## 1. Run a llamafile

Download a model and start it in server mode with an OpenAI-compatible API
(swap in whichever model you like):

```bash
curl -LO https://huggingface.co/mozilla-ai/llamafile_0.10/resolve/main/Qwen3.5-0.8B-Q8_0.llamafile
chmod +x Qwen3.5-0.8B-Q8_0.llamafile
./Qwen3.5-0.8B-Q8_0.llamafile --server --port 8080
```

By default this exposes `http://localhost:8080/v1/chat/completions`.

## 2. Run this app locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With the default
`.env.local` (`LLAMAFILE_URL=http://localhost:8080/v1/chat/completions`),
it'll talk straight to the llamafile server from step 1.

## 3. Deploying to Vercel

This is the part that needs a little care: **Vercel's servers run in the
cloud, not on your laptop**, so they can't reach `http://localhost:8080`.
You have two options:

**Option A — expose your llamafile server publicly**
Run a tunnel (e.g. [ngrok](https://ngrok.com) or a Cloudflare Tunnel) pointed
at port 8080, then set the tunnel's public URL as `LLAMAFILE_URL` in your
Vercel project's Environment Variables (Project Settings → Environment
Variables), e.g.:

```
LLAMAFILE_URL=https://your-tunnel-id.ngrok-free.app/v1/chat/completions
```

**Option B — run llamafile on a server you control**
Put llamafile on a small VPS with a public IP, run it with `--server`, and
point `LLAMAFILE_URL` at that machine instead of a tunnel.

Either way:

```bash
vercel deploy
```

or connect the repo in the Vercel dashboard and set `LLAMAFILE_URL` (and
`LLAMAFILE_API_KEY` if you started llamafile with `--api-key`) under
Environment Variables before the first deploy.

## What's in the box

- `app/api/chat/route.ts` — server-side proxy that forwards chat requests to
  `LLAMAFILE_URL` and streams the response straight back.
- `app/api/health/route.ts` — lightweight reachability check, polled by the
  status pill in the header.
- `app/components/` — the sidebar (conversations as "files"), message list,
  composer, status pill, and settings popover.
- `lib/storage.ts` — conversations persist in the browser's `localStorage`,
  so refreshing the page doesn't lose your chats.
- `lib/api.ts` — parses the server-sent-events stream from `/api/chat` into
  incremental tokens.

## Notes

- Most llamafiles ignore the `model` field in requests (there's only one
  model loaded), but it's exposed in Settings in case your server routes on it.
- Conversation history is stored per-browser, not synced anywhere — clearing
  site data will clear it.
