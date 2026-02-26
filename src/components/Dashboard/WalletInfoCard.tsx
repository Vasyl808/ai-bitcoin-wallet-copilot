import { useState } from 'react';
import { Copy, Check, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { useWalletData } from '../../hooks/useWalletData';

interface WalletInfoCardProps {
  walletId: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const NETWORK_COLORS: Record<string, string> = {
  mainnet: '#f7931a',
  testnet: '#3b82f6',
  regtest: '#a855f7',
};

export default function WalletInfoCard({ walletId, onRefresh, isRefreshing }: WalletInfoCardProps) {
  const { wallets } = useWalletStore();
  const wallet = wallets.find((w) => w.id === walletId);
  const { parsedData } = useWalletData(walletId);
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="card card-glow">
      <div className="card-label">
        <span>Wallet</span>
        <span style={{
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          background: NETWORK_COLORS[wallet.network] + '22',
          color: NETWORK_COLORS[wallet.network],
          fontWeight: 600,
        }}>
          {wallet.network}
        </span>
      </div>

      <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', wordBreak: 'break-all' }}>
        {wallet.label}
      </div>

      {/* Address */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <span className="font-mono text-sm" style={{ flex: 1, wordBreak: 'break-all', fontSize: '12px', color: 'var(--text-secondary)' }}>
          {wallet.address}
        </span>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={parsedData?.url ?? `https://opscan.org/accounts/${wallet.address}?network=${wallet.network}`}
            target="_blank"
            rel="noopener noreferrer"
            className="copy-btn"
          >
            <ExternalLink size={11} /> View
          </a>
        </div>
      </div>

      {/* Wallet info from API */}
      {parsedData?.walletInfo && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div>
            <div className="text-xs text-muted">Address Type</div>
            <div className="badge badge-blue" style={{ marginTop: '4px' }}>
              {parsedData.walletInfo.addressType}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Token Count</div>
            <div className="badge badge-purple" style={{ marginTop: '4px' }}>
              {parsedData.walletInfo.tokenCount} tokens
            </div>
          </div>
        </div>
      )}

      {/* Footer: last updated + refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginTop: 'auto' }}>
        <Clock size={12} />
        <span>Updated {wallet.lastFetched ? formatDate(wallet.lastFetched) : 'never'}</span>
        <button
          className="btn btn-ghost btn-xs"
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCw size={12} style={isRefreshing ? { animation: 'spin 0.7s linear infinite' } : {}} />
          Refresh
        </button>
      </div>
    </div>
  );
}
