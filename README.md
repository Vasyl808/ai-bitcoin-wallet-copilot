# OP_NET Wallet Copilot

A modern React SPA for viewing Bitcoin/OP_NET wallet data with AI-powered insights via Groq/Llama 3.

## 🚀 Quick Start with Docker

```bash
# 1. Copy env file and add your Groq API key
cp .env.example .env
# Edit .env: VITE_GROQ_API_KEY=gsk_your_key_here

# 2. Build & run (production build served by Nginx)
docker-compose up --build

# Open http://localhost:3000
```

Get your free Groq API key at: https://console.groq.com

## 🔧 Development (hot reload)

```bash
docker-compose --profile dev up dev
# Open http://localhost:5173
```

## 🌐 Deploy to Netlify

1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Build: `npm run build`, Publish: `dist`
4. Set `VITE_GROQ_API_KEY` in Netlify → Site Settings → Environment Variables

## Features

- **Multi-wallet** — Add/switch/remove multiple addresses
- **Live data** — Fetches BTC balance, tokens, transactions from opscan.org API
- **AI Analysis** — One-click wallet analysis via Groq (Llama 3)
- **AI Chat** — Ask questions about wallet activity, per-wallet chat history
- **OP Wallet** — Connect directly or add address manually
- **Networks** — Mainnet, Testnet, Regtest

## Tech Stack

- React + TypeScript + Vite
- Zustand (wallet state) + React Query (data fetching)
- Groq Cloud API (Llama 3 8B)
- opscan.org REST API (no scraping — uses `api.opscan.org`)
- Docker + Nginx for deployment
- Netlify-ready
