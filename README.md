# Chromalink

A real-time collaborative pixel art canvas where you can draw with friends. No signup, no BS, just pixels.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte)

## What is this?

Think Google Docs, but for pixel art. See everyone's cursor, draw together in real-time, and make cool patterns with symmetry modes.

## Features

- **Real-time collaboration** - See everyone's cursor and strokes instantly
- **Live chat** - Talk while you draw
- **Brush sizes** - 1x1 to 8x8 pixels
- **Symmetry modes** - Horizontal, vertical, quad, 4-way & 8-way radial
- **Public or private rooms** - Share openly or lock with a password
- **No signup required** - Pick a nickname and start drawing
- **Eraser tool** - Fix mistakes easily
- **Undo/redo** - Ctrl+Z to undo, and Ctrl+Y to redo

## Tech Stack

- **Frontend**: Svelte 5, SvelteKit, TailwindCSS
- **Backend**: NestJS, Socket.io
- **Real-time**: WebSockets
- **Runtime**: Bun

## Why Svelte?

- No virtual DOM reconciliation
- No `useEffect` footguns
- No context provider hell
- Just reactive state that works

The new Svelte 5 runes (`$state`, `$effect`, `$derived`) are beautifully simple - no dependency arrays, no stale closures.

## Development

### Prerequisites

- [Bun](https://bun.sh) (or Node.js) (latest version recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/QaidVoid/chromalink.git
cd chromalink

# Install dependencies
bun install
```

### Running locally

```bash
# Start both client and server in development mode
bun dev

# Or run them separately:
bun dev:client  # Client runs on http://localhost:5173
bun dev:server  # Server runs on http://localhost:3000
```

### Building for production

```bash
# Build both client and server
bun run build

# Or build separately:
bun run build:client
bun run build:server
```

## Deployment

### Environment Variables

**Client** (`packages/client/.env`):
```bash
PUBLIC_API_URL=https://your-backend-url.com
```

**Server** (configure as needed for your backend):
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origins

### Deployment Steps

1. **Build everything**:
   ```bash
   bun run build
   ```

2. **Deploy the backend** (server):
   - Deploy `packages/server` to your hosting platform
   - Set environment variables
   - Ensure WebSocket support is enabled

3. **Deploy the frontend** (client):
   - Set `PUBLIC_API_URL` to your backend URL
   - Deploy `packages/client` to Vercel, Netlify, or similar
   - The build output is in `packages/client/build`

4. **CORS Configuration**:
   - Make sure your backend allows requests from your frontend domain

## Project Structure

```
chromalink/
├── packages/
│   ├── client/          # SvelteKit frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/  # Svelte components
│   │   │   │   ├── stores/      # State management
│   │   │   │   └── theme/       # Colors and theming
│   │   │   └── routes/          # SvelteKit pages
│   │   └── package.json
│   └── server/          # NestJS backend
│       ├── src/
│       │   ├── board/           # Canvas logic
│       │   ├── chat/            # Chat functionality
│       │   ├── room/            # Room management
│       │   └── gateway/         # WebSocket gateway
│       └── package.json
└── package.json
```

## Contributing

PRs welcome! This project was built for fun and learning.

## License

MIT

---

*Made with Svelte 5, because life's too short for `useEffect` debugging*
