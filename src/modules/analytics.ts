import type {
  ParsedAddress,
  BalanceInfo,
  TransactionStats,
  TokenStats,
  WalletAnalytics,
  WalletSnapshot,
} from '../types';

// ─── Balance Parser ───────────────────────────────────────────────────────────

export function parseBalance(data: ParsedAddress): BalanceInfo {
  if (data.btcBalanceSats !== null) {
    const sats = data.btcBalanceSats;
    const btc = sats / 1e8;
    return {
      btc,
      sats,
      formatted: `${btc.toFixed(8)} BTC`,
      unknown: false,
    };
  }

  if (data.btcBalance) {
    // Try to parse string like "0.02012400 BTC"
    const btcMatch = data.btcBalance.match(/([\d.]+)\s*BTC/i);
    if (btcMatch) {
      const btc = parseFloat(btcMatch[1]);
      return {
        btc,
        sats: Math.round(btc * 1e8),
        formatted: `${btc.toFixed(8)} BTC`,
        unknown: false,
      };
    }

    const satsMatch = data.btcBalance.match(/([\d,]+)\s*sats?/i);
    if (satsMatch) {
      const sats = parseInt(satsMatch[1].replace(/,/g, ''), 10);
      const btc = sats / 1e8;
      return {
        btc,
        sats,
        formatted: `${btc.toFixed(8)} BTC`,
        unknown: false,
      };
    }
  }

  return {
    btc: null,
    sats: null,
    formatted: 'Unknown',
    unknown: true,
  };
}

// ─── Transaction Stats ────────────────────────────────────────────────────────

export function analyzeTransactions(data: ParsedAddress): TransactionStats {
  const txs = data.transactions || [];

  const interactions = txs.filter((tx) => tx.type === 'interaction').length;
  const transfers = txs.filter((tx) => tx.type === 'generic' || tx.type === 'transfer').length;

  // Calculate gas statistics
  const totalGasUsed = txs.reduce((sum, tx) => sum + (tx.gasUsed || 0), 0);
  const totalGasSats = txs.reduce((sum, tx) => sum + (tx.gasSats || 0), 0);
  const averageGasPerTx = txs.length > 0 ? Math.round(totalGasUsed / txs.length) : 0;

  // Find latest by blockHeight or blockTime
  const sorted = [...txs].sort((a, b) => {
    if (a.blockHeight && b.blockHeight) return b.blockHeight - a.blockHeight;
    if (a.blockTime && b.blockTime) return new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime();
    return 0;
  });

  const latest = sorted[0];

  return {
    total: txs.length,
    recent: sorted.slice(0, 10),
    interactions,
    transfers,
    latestBlockTime: latest?.blockTime,
    latestBlockHeight: latest?.blockHeight,
    totalGasUsed,
    totalGasSats,
    averageGasPerTx,
  };
}

// ─── Token Stats ──────────────────────────────────────────────────────────────

export function analyzeTokens(data: ParsedAddress): TokenStats {
  const tokens = data.tokens || [];

  const nonZero = tokens.filter((t) => {
    const val = parseFloat(t.balance.replace(/,/g, ''));
    return !isNaN(val) && val > 0;
  });

  // Sort top tokens by balance (numeric)
  const sorted = [...tokens].sort((a, b) => {
    const va = parseFloat(a.balance.replace(/,/g, '')) || 0;
    const vb = parseFloat(b.balance.replace(/,/g, '')) || 0;
    return vb - va;
  });

  return {
    total: tokens.length,
    nonZero: nonZero.length,
    top: sorted.slice(0, 5),
  };
}

// ─── Full Analytics ───────────────────────────────────────────────────────────

export function buildAnalytics(data: ParsedAddress): WalletAnalytics {
  const transactions = analyzeTransactions(data);
  
  const gasStats = {
    totalGasUsed: transactions.totalGasUsed || 0,
    totalGasSats: transactions.totalGasSats || 0,
    averageGasPerTx: transactions.averageGasPerTx || 0,
    totalFees: `${(transactions.totalGasSats || 0).toLocaleString()} sats`,
  };

  return {
    balance: parseBalance(data),
    transactions,
    tokens: analyzeTokens(data),
    gasStats,
  };
}

// ─── Wallet Snapshot for LLM ──────────────────────────────────────────────────

export function buildWalletSnapshot(data: ParsedAddress): WalletSnapshot {
  const analytics = buildAnalytics(data);

  return {
    address: data.address,
    network: data.network,
    btc: {
      btc: analytics.balance.btc,
      sats: analytics.balance.sats,
      rawText: data.btcBalance,
    },
    tokens: data.tokens,
    tokenCount: data.walletInfo?.tokenCount ?? data.tokens.length,
    transactions: {
      total: analytics.transactions.total,
      recent: analytics.transactions.recent,
      interactions: analytics.transactions.interactions,
      transfers: analytics.transactions.transfers,
      latestBlockTime: analytics.transactions.latestBlockTime,
      latestBlockHeight: analytics.transactions.latestBlockHeight,
    },
    walletInfo: data.walletInfo,
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatSats(sats: number): string {
  return sats.toLocaleString() + ' sats';
}

export function formatBTC(btc: number): string {
  return btc.toFixed(8) + ' BTC';
}

export function formatGas(gasUsed?: number): string {
  if (!gasUsed) return '0';
  return gasUsed.toLocaleString();
}

export function formatGasSats(gasSats?: number): string {
  if (!gasSats) return '0 sats';
  return `${gasSats.toLocaleString()} sats`;
}

export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Unknown time';
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
