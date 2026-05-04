# CineMatch 🎬

A conversational movie recommendation agent with memory. Tell it what you're in the mood for, get personalized picks with explained reasons, and give feedback that shapes every future recommendation.

## Prerequisites

* Node.js 18.17+
* npm 9+
* Anthropic API key
* TMDB API key

## Getting started

### 1. Install 

```bash
npm install
```

### 2. Add your API keys

Edit `.env.local` with your keys:

```
ANTHROPIC_API_KEY=your_anthropic_key_here
TMDB_API_KEY=your_tmdb_key_here
```

- **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)
- **TMDB API key** — get one free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to use

1. **Landing page** — describe what you're in the mood for in plain English, or pick a suggestion
2. **Chat** — get 3–5 movie cards with posters, ratings, runtime, and a personalized reason
3. **Follow up** — ask questions or refine ("something from the 90s", "shorter please")
4. **Feedback** — click "Give Feedback" on any card, select quick tags or write a note
5. **Profile** — visit `/profile` to see what the app has learned about you and edit it manually

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| AI | Claude API (`claude-sonnet-4-6`) |
| Movie data | TMDB API |
| Database | SQLite (`better-sqlite3`) |
| Identity | Anonymous UUID (localStorage) |

## Project structure

```
app/
  page.tsx              # Landing / onboarding
  chat/page.tsx         # Main chat interface
  profile/page.tsx      # Preference profile editor
  api/
    chat/               # Claude conversation handler
    feedback/           # Feedback → profile update
    movies/             # TMDB enrichment
    profile/            # Profile CRUD
components/
  chat/                 # ChatWindow, MessageBubble, InputBar
  movies/               # MovieCard, MovieGrid, FeedbackPanel
  profile/              # ProfileEditor
  onboarding/           # OnboardingFlow
lib/
  claude.ts             # Anthropic SDK wrapper
  tmdb.ts               # TMDB search and fetch
  db.ts                 # SQLite setup
  promptBuilder.ts      # Dynamic system prompt assembly
  profileBuilder.ts     # Feedback → preference signal extraction
```

## Data storage

User profiles and feedback are stored locally in `data/db.sqlite` (created automatically on first run). This file is gitignored — your data stays on your machine.
