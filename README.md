# AI Bitcoin Wallet Copilot

A sophisticated web application that revolutionizes Bitcoin L1 wallet management through artificial intelligence. By integrating Groq's advanced language models with real-time opscan.org blockchain data, our assistant provides intelligent insights and natural language interaction for Bitcoin users.

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

## 🌐 Deploy to Netlify/Vercel

1. Push to GitHub
2. Connect repo in Netlify/Vercel dashboard
3. Build: `npm run build`, Publish: `dist`
4. Set `VITE_GROQ_API_KEY` in Environment Variables

## Features

- **AI-Powered Chat** - Ask questions about wallet, transactions, and Bitcoin concepts
- **Real-Time Analytics** - Balance, transaction history, tokens, and gas usage patterns
- **Gas Optimization** - Detailed gas statistics and fee analysis
- **Smart Contract Support** - Full OP_NET smart contract and token interactions
- **Multi-wallet** - Add/switch/remove multiple addresses
- **Networks** - Mainnet, Testnet, Regtest
- **Live data** - Real-time data from opscan.org API

## Tech Stack

- React + TypeScript + Vite
- Zustand (wallet state) + React Query (data fetching)
- Groq Cloud API (Llama 3)
- opscan.org REST API
- Docker + Nginx for deployment
- Netlify/Vercel ready

## Gas Analytics

The application provides comprehensive gas metrics:
- Total gas used across all transactions
- Total gas fees paid in satoshis
- Average gas per transaction
- Priority fee tracking
- Gas usage patterns and optimization insights

## Security

- Environment variables are properly configured
- API keys are never exposed in frontend
- Secure deployment practices followed
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed security guide
