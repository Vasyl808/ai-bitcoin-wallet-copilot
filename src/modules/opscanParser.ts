import type { Network, ParsedAddress, ParsedToken, ParsedTransaction, WalletInfo } from '../types';

const API_BASE = 'https://api.opscan.org/v1';
const OPSCAN_BASE = 'https://opscan.org';

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json() as Promise<T>;
}

// ─── Normalize network name for API ──────────────────────────────────────────

function getApiNetwork(network: Network): string {
  if (network === 'testnet') return 'op_testnet';
  return network; // mainnet or regtest
}

// ─── Wallet Info ──────────────────────────────────────────────────────────────

async function fetchWalletInfo(address: string, network: Network): Promise<WalletInfo | null> {
  try {
    const apiNetwork = getApiNetwork(network);
    const url = `${API_BASE}/${apiNetwork}/wallets/${address}`;
    const data = await apiFetch<WalletInfo>(url);
    return data;
  } catch (err) {
    console.warn('Failed to fetch wallet info:', err);
    return null;
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

interface ApiTransaction {
  id: string;
  hash?: string;
  type: string;
  blockHeight?: number;
  blockTime?: string;
  gasUsed?: number;
  gasSats?: number;
  priorityFee?: number;
  refundedGas?: number;
  refundedGasSats?: number;
  contractAddress?: string;
  revert?: string | null;
  isSender?: boolean;
  addressSentValue?: string;
  addressReceivedValue?: string;
  addressNetValue?: string;
  decodedMethodArgs?: { name?: string } | null;
}

interface ApiTransactionsResponse {
  results: ApiTransaction[];
  nextCursor?: string | number | null;
}

async function fetchTransactions(
  address: string,
  network: Network,
  limit = 10000000
): Promise<ParsedTransaction[]> {
  try {
    const apiNetwork = getApiNetwork(network);
    const url = `${API_BASE}/${apiNetwork}/wallets/${address}/transactions?cursor=0&limit=${limit}`;
    const data = await apiFetch<ApiTransactionsResponse>(url);

    return (data.results || []).map((tx): ParsedTransaction => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type || 'unknown',
      blockHeight: tx.blockHeight,
      blockTime: tx.blockTime,
      gasUsed: tx.gasUsed,
      gasSats: tx.gasSats,
      priorityFee: tx.priorityFee,
      refundedGas: tx.refundedGas,
      refundedGasSats: tx.refundedGasSats,
      isSender: tx.isSender,
      addressSentValue: tx.addressSentValue,
      addressReceivedValue: tx.addressReceivedValue,
      addressNetValue: tx.addressNetValue,
      contractAddress: tx.contractAddress ?? undefined,
      methodName: tx.decodedMethodArgs?.name,
      revert: tx.revert,
      url: `${OPSCAN_BASE}/transactions/${tx.id}?network=${network}`,
    }));
  } catch (err) {
    console.warn('Failed to fetch transactions:', err);
    return [];
  }
}

// ─── Token Balances ───────────────────────────────────────────────────────────

interface ApiBalance {
  id: string;
  network: string;
  contractAddress: string;
  holderAddress: string;
  balance: string;
  tokenId?: string | null;
  contract: {
    network: string;
    blockHeight: number;
    address: string;
    wasCompressed: boolean;
    deployTransactionId: string;
    deployerAddress: string;
    deployedAt: number;
    isOP20: boolean;
    op20Metadata?: {
      symbol: string;
      name: string;
      totalSupply: number;
      maximumSupply: number;
      decimals: number;
      owner?: string | null;
      isPool?: boolean;
      token0?: string | null;
      token1?: string | null;
    };
    verified?: string | null;
  };
}

interface ApiBalancesResponse {
  results: ApiBalance[];
  nextCursor?: string | number | null;
}

async function fetchBalances(address: string, network: Network): Promise<ParsedToken[]> {
  try {
    const apiNetwork = getApiNetwork(network);
    const url = `${API_BASE}/${apiNetwork}/wallets/${address}/balances?cursor=0&limit=50`;
    const data = await apiFetch<ApiBalancesResponse>(url);

    return (data.results || []).map((b): ParsedToken => {
      const metadata = b.contract?.op20Metadata;
      const name = metadata?.name || metadata?.symbol || 'Unknown Token';
      const balance = b.balance || '0';
      const decimals = metadata?.decimals;
      
      // Format balance based on decimals if available
      let formattedBalance = balance;
      if (decimals && decimals > 0) {
        const balanceNum = Number(balance) / Math.pow(10, decimals);
        formattedBalance = balanceNum.toLocaleString(undefined, { maximumFractionDigits: 6 });
      }

      return {
        name,
        balance: formattedBalance,
        contractAddress: b.contractAddress,
        decimals,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch balances:', err);
    return [];
  }
}

// ─── Main Parser Function ─────────────────────────────────────────────────────

export async function parseAddress(
  address: string,
  network: Network
): Promise<ParsedAddress> {
  const url = `${OPSCAN_BASE}/accounts/${address}?network=${network}`;

  // Fetch all data in parallel
  const [walletInfo, transactions, tokens] = await Promise.all([
    fetchWalletInfo(address, network),
    fetchTransactions(address, network,100000000),
    fetchBalances(address, network),
  ]);

  // Format BTC balance from sats
  let btcBalance: string | null = null;
  let btcBalanceSats: number | null = null;

  if (walletInfo?.balance) {
    try {
      const sats = parseInt(walletInfo.balance, 100000000);
      if (!isNaN(sats)) {
        btcBalanceSats = sats;
        const btcValue = sats / 1e8;
        btcBalance = `${btcValue.toFixed(8)} BTC`;
      }
    } catch {
      btcBalance = walletInfo.balance;
    }
  }

  return {
    address,
    network,
    url,
    scrapedAt: new Date().toISOString(),
    btcBalance,
    btcBalanceSats,
    tokens,
    transactions,
    walletInfo,
    discoveredApiEndpoints: [
      `${API_BASE}/${getApiNetwork(network)}/wallets/${address}`,
      `${API_BASE}/${getApiNetwork(network)}/wallets/${address}/transactions`,
      `${API_BASE}/${getApiNetwork(network)}/wallets/${address}/balances`,
    ],
  };
}

export type { ParsedAddress };
