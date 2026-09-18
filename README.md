# Nova — Multilingual, Human-Like AI Chatbot

A production-ready, full-stack Generative AI web application: a multilingual,
emotionally-aware AI chatbot with a neo-glassmorphic dark UI, real-time
streaming responses, persona switching, and persistent conversation history.

## Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React (Vite), Tailwind CSS, Framer Motion, Lucide React, Zustand |
| Backend   | Node.js, Express |
| Database  | MongoDB + Mongoose |
| AI        | OpenAI API (Chat Completions, streaming via SSE) |
| Data fetching | Axios, native `fetch` streaming |

## Project structure

```
genai-chatbot/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/      # Sidebar, ChatWindow, MessageBubble, etc.
│   │   ├── hooks/            # useStreamChat, useConversations
│   │   ├── services/         # api.js (axios + SSE fetch client)
│   │   ├── store/             # useChatStore (Zustand)
│   │   └── utils/              # constants (personas, languages, prompts)
│   ├── index.html
│   └── vite.config.js
└── server/                  # Express backend
    ├── config/db.js          # Mongoose connection
    ├── models/Conversation.js
    ├── controllers/           # chatController (SSE), conversationController (CRUD)
    ├── routes/                 # /api/chat, /api/conversations
    ├── services/aiService.js   # OpenAI integration + persona prompts
    ├── middleware/errorHandler.js
    └── server.js
```

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A MongoDB instance (local, or a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas))
- An [OpenAI API key](https://platform.openai.com/api-keys)

## 1. Local setup

### Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI and OPENAI_API_KEY
npm run dev
```

The API starts on `http://localhost:5000`. Verify it's alive:

```bash
curl http://localhost:5000/api/health
```

### Frontend

```bash
cd client
npm install
cp .env.example .env   # defaults work out of the box for local dev
npm run dev
```

The app opens on `http://localhost:5173`. Vite proxies `/api/*` requests to
the backend automatically (see `vite.config.js`), so no CORS setup is needed
for local development.

## 2. How it works

- **Streaming chat**: `POST /api/chat` opens a Server-Sent Events stream.
  The backend forwards each token from OpenAI's streaming Chat Completions
  API to the client as it's generated, so replies appear character-by-character
  with no perceptible lag. The frontend's `useStreamChat` hook manages this
  via a `fetch` + `ReadableStream` reader (native `EventSource` can't send a
  POST body, so this is implemented manually in `services/api.js`).
- **Multilingual replies**: the system prompt instructs the model to detect
  and mirror the user's language automatically, or to lock to a
  user-selected language from the sidebar's language selector.
- **Personas**: three distinct system prompts (Empathetic Friend, Professional
  Strategist, Creative Visionary) shape tone and structure. Switching persona
  mid-conversation applies to the next message onward.
- **Conversation persistence**: every conversation is saved to MongoDB with
  its full message history, persona, and language. The sidebar lists past
  conversations, auto-titled from the first exchange.
- **Voice playback**: the audio toggle in the header uses the browser's
  built-in Web Speech API (`speechSynthesis`) — no external TTS service or
  API key required. It picks a voice locale based on the active language.

## 3. Building for production

### Frontend

```bash
cd client
npm run build
```

Outputs static assets to `client/dist/`. Preview locally with `npm run preview`.

### Backend

The backend runs as-is with `npm start` (no build step needed for plain
Node/Express).

## 4. Deploying

### Frontend → Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo and set the **root directory** to `client`.
3. Build command: `npm run build`, output directory: `dist` (Vercel
   auto-detects this for Vite).
4. Add an environment variable `VITE_API_URL` pointing to your deployed
   backend, e.g. `https://your-api.onrender.com/api`.
5. `client/vercel.json` is already included to handle SPA client-side routing.

### Backend → Render

1. In Render, create a new **Web Service** from this repo with root
   directory `server` (or use the included `server/render.yaml` as a Blueprint).
2. Build command: `npm install`. Start command: `npm start`.
3. Set environment variables in the Render dashboard: `MONGODB_URI`,
   `OPENAI_API_KEY`, `OPENAI_MODEL`, `CLIENT_URL` (your deployed frontend
   origin, for CORS), `NODE_ENV=production`.
4. Once live, update the frontend's `VITE_API_URL` to match your Render URL
   and redeploy the frontend.

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access from your backend host
   (or `0.0.0.0/0` for simplicity during early deployment).
3. Copy the connection string into `MONGODB_URI` on your backend host.

## 5. Environment variables reference

**server/.env**

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `MONGODB_URI` | MongoDB connection string |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Chat model to use (default `gpt-4o-mini`) |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window for `/api/chat` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window per IP |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (defaults to `/api`, proxied locally by Vite) |

## 6. Notes on extending this app

- **Authentication**: the `Conversation` model already includes a `userId`
  field (defaulting to `"anonymous"`). Wire up JWT or session auth and pass
  the authenticated user's ID into the controllers to scope conversations
  per user.
- **Swapping AI providers**: all model calls are isolated in
  `server/services/aiService.js`. To use Google's Gen AI SDK (Gemini)
  instead of OpenAI, replace the client instantiation and the
  `streamChatCompletion` implementation — the rest of the app (routes,
  controllers, frontend) is provider-agnostic.
- **PostgreSQL instead of MongoDB**: swap `models/Conversation.js` and
  `config/db.js` for a Prisma schema/client; the controllers' method calls
  would need light adjustment but the route/response shapes can stay the same.
