import type { ChatMessage, WalletSnapshot } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(snapshot: WalletSnapshot): string {
  return `You are OP_NET Wallet Copilot — a helpful, knowledgeable AI assistant for Bitcoin and OP_NET blockchain wallets. You answer in English.

IMPORTANT RULES:
- You ONLY analyze data from the provided wallet snapshot
- You explain blockchain terms in simple language
- You DO NOT give financial or investment advice
- You DO NOT suggest to buy or sell anything
- You are informational only — you analyze wallet activity, not predict markets
- Always mention that your analysis is based only on the provided snapshot data

CURRENT WALLET SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

EXPLANATION OF KEY TERMS:
- BTC: Bitcoin, the base currency
- Sats/Satoshis: 1 BTC = 100,000,000 satoshis (the smallest unit)
- Gas Used: Computational resources consumed by a transaction
- Gas Fees: Amount paid in satoshis for transaction processing
- Priority Fee: Additional fee to incentivize faster transaction inclusion
- Average Gas per Tx: Typical gas consumption for transactions in this wallet
- OP_NET: A smart contract layer on top of Bitcoin
- Interaction: A smart contract function call
- Generic/Transfer: A regular BTC transfer
- Gas: Fee paid to execute a smart contract
- Regtest: A local test network (not real money)
- Testnet: A public test network (not real money)
- Mainnet: The real Bitcoin network

Be concise, friendly, and helpful. Format responses with bullet points when listing multiple items.`;
}

// ─── Single Analysis Request ──────────────────────────────────────────────────

export async function analyzeWallet(snapshot: WalletSnapshot): Promise<string> {
  if (!API_KEY) {
    throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY in your .env file.');
  }

  const systemPrompt = buildSystemPrompt(snapshot);
  const userMessage = `Please provide a comprehensive analysis of this wallet. Include:
1. Balance summary (BTC and sats)
2. Token/asset holdings overview
3. Transaction activity summary (types, frequency)
4. Notable patterns or interesting observations
5. Any warnings or unusual activity (if applicable)

Keep your response clear and easy to understand for someone new to Bitcoin/OP_NET.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || 'No response from AI.';
}

// ─── Chat Request ─────────────────────────────────────────────────────────────

export async function sendChatMessage(
  snapshot: WalletSnapshot,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY in your .env file.');
  }

  const systemPrompt = buildSystemPrompt(snapshot);

  // Build messages from history (skip loading messages)
  const historyMessages = history
    .filter((m) => !m.isLoading && m.role !== 'system')
    .slice(-20) // keep last 20 for context window
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || 'No response from AI.';
}

export function hasGroqKey(): boolean {
  return !!API_KEY && API_KEY !== 'gsk_your_groq_api_key_here';
}
