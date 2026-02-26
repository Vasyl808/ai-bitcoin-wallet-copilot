// ─── Network Types ────────────────────────────────────────────────────────────

export type Network = 'mainnet' | 'testnet' | 'regtest';

// ─── Opscan Parser Types ──────────────────────────────────────────────────────

export type ParsedToken = {
  name: string;
  balance: string;
  contractAddress?: string;
  decimals?: number;
  extra?: string;
};

export type ParsedTransaction = {
  id: string;
  hash?: string;
  type: string;
  blockHeight?: number;
  blockTime?: string;
  gasUsed?: number;
  gasSats?: number;
  totalFees?: string;
  priorityFee?: number;
  refundedGas?: number;
  refundedGasSats?: number;
  isSender?: boolean;
  addressSentValue?: string;
  addressReceivedValue?: string;
  addressNetValue?: string;
  contractAddress?: string;
  methodName?: string;
  revert?: string | null;
  url: string;
};

export type WalletInfo = {
  addressType: string;
  address: string;
  balance: string; // sats as string
  tokenCount: number;
  associatedAddresses: Array<{ type: string; address: string }>;
  isContract: boolean;
};

export type ParsedAddress = {
  address: string;
  network: Network;
  url: string;
  scrapedAt: string;
  btcBalance: string | null; // formatted string like "0.02012400 BTC"
  btcBalanceSats: number | null;
  tokens: ParsedToken[];
  transactions: ParsedTransaction[];
  walletInfo: WalletInfo | null;
  discoveredApiEndpoints: string[];
};

// ─── Wallet Store Types ───────────────────────────────────────────────────────

export type WalletEntry = {
  id: string;
  address: string;
  label: string;
  network: Network;
  addedAt: string;
  lastFetched?: string;
  parsedData?: ParsedAddress;
};

export type WalletStore = {
  wallets: WalletEntry[];
  activeWalletId: string | null;
  chatHistories: Record<string, ChatMessage[]>;
  addWallet: (address: string, network: Network, label?: string) => WalletEntry;
  removeWallet: (id: string) => void;
  setActiveWallet: (id: string | null) => void;
  updateWalletData: (id: string, data: ParsedAddress) => void;
  addChatMessage: (walletId: string, message: ChatMessage) => void;
  clearChatHistory: (walletId: string) => void;
  getActiveWallet: () => WalletEntry | null;
};

// ─── Analytics Types ──────────────────────────────────────────────────────────

export type BalanceInfo = {
  btc: number | null;
  sats: number | null;
  formatted: string;
  unknown: boolean;
};

export type TransactionStats = {
  total: number;
  recent: ParsedTransaction[];
  interactions: number;
  transfers: number;
  latestBlockTime?: string;
  latestBlockHeight?: number;
  totalGasUsed?: number;
  totalGasSats?: number;
  averageGasPerTx?: number;
};

export type TokenStats = {
  total: number;
  nonZero: number;
  top: ParsedToken[];
};

export type WalletAnalytics = {
  balance: BalanceInfo;
  transactions: TransactionStats;
  tokens: TokenStats;
  gasStats?: {
    totalGasUsed: number;
    totalGasSats: number;
    averageGasPerTx: number;
    totalFees: string;
  };
};

// ─── LLM Types ───────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  isLoading?: boolean;
};

export type WalletSnapshot = {
  address: string;
  network: string;
  btc: {
    btc: number | null;
    sats: number | null;
    rawText: string | null;
  };
  tokens: ParsedToken[];
  tokenCount: number;
  transactions: {
    total: number;
    recent: ParsedTransaction[];
    interactions: number;
    transfers: number;
    latestBlockTime?: string;
    latestBlockHeight?: number;
  };
  walletInfo: WalletInfo | null;
};

// ─── OP Wallet Injector Type ─────────────────────────────────────────────────

declare global {
  interface Window {
    opnet?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      network?: string;
    };
    unisat?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      getNetwork: () => Promise<string>;
    };
    bitcoin?: {
      connect: () => Promise<{ address: string }>;
    };
  }
}
