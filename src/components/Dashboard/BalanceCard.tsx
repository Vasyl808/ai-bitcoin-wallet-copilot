import { Coins, Zap } from 'lucide-react';
import type { WalletAnalytics } from '../../types';

interface BalanceCardProps {
  isLoading: boolean;
  analytics: WalletAnalytics | null;
}

export default function BalanceCard({ isLoading, analytics }: BalanceCardProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-label"><Coins size={12} /> BTC Balance</div>
        <div className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="skeleton" style={{ height: 64, flex: 1, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 64, flex: 1, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 64, flex: 1, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  const bal = analytics?.balance;
  const txs = analytics?.transactions;
  const toks = analytics?.tokens;
  const gas = analytics?.gasStats;

  return (
    <div className="card">
      <div className="card-label"><Coins size={12} /> BTC Balance</div>

      {bal && !bal.unknown ? (
        <>
          <div className="balance-value">
            {bal.btc !== null ? bal.btc.toFixed(8) : '—'}
          </div>
          <div className="balance-sats">
            {bal.sats !== null ? `${bal.sats.toLocaleString()} sats` : ''}
          </div>
        </>
      ) : (
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
          {!analytics ? 'No data yet' : 'Balance unavailable'}
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid mt-4">
        <div className="stat-card">
          <div className="stat-value">{txs?.total ?? '—'}</div>
          <div className="stat-label">Transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{toks?.total ?? '—'}</div>
          <div className="stat-label">Tokens</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{txs?.interactions ?? '—'}</div>
          <div className="stat-label">Interactions</div>
        </div>
      </div>

      {/* Gas Stats */}
      {gas && gas.totalGasUsed > 0 && (
        <div className="card" style={{ marginTop: '16px', background: 'var(--bg-secondary)' }}>
          <div className="card-label"><Zap size={12} /> Gas Statistics</div>
          <div className="stat-grid mt-3">
            <div className="stat-card" style={{ padding: '12px 8px' }}>
              <div className="stat-value" style={{ fontSize: '14px' }}>
                {gas.totalGasUsed.toLocaleString()}
              </div>
              <div className="stat-label" style={{ fontSize: '10px' }}>Total Gas</div>
            </div>
            <div className="stat-card" style={{ padding: '12px 8px' }}>
              <div className="stat-value" style={{ fontSize: '14px' }}>
                {gas.totalFees}
              </div>
              <div className="stat-label" style={{ fontSize: '10px' }}>Total Fees</div>
            </div>
            <div className="stat-card" style={{ padding: '12px 8px' }}>
              <div className="stat-value" style={{ fontSize: '14px' }}>
                {gas.averageGasPerTx.toLocaleString()}
              </div>
              <div className="stat-label" style={{ fontSize: '10px' }}>Avg Gas/Tx</div>
            </div>
          </div>
        </div>
      )}

      {/* Last tx */}
      {txs?.latestBlockHeight && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Latest block: #{txs.latestBlockHeight.toLocaleString()}
        </div>
      )}
    </div>
  );
}
