import { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useWalletData } from '../../hooks/useWalletData';
import { buildAnalytics } from '../../modules/analytics';
import WalletInfoCard from './WalletInfoCard';
import BalanceCard from './BalanceCard';
import TokensTable from './TokensTable';
import TransactionsTable from './TransactionsTable';
import ChatPanel from '../Chat/ChatPanel';

interface DashboardProps {
  walletId: string;
}

export default function Dashboard({ walletId }: DashboardProps) {
  const { parsedData, isLoading, isError, error, refetch, isFetching } = useWalletData(walletId);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'chat'>('overview');

  const analytics = parsedData ? buildAnalytics(parsedData) : null;

  return (
    <main className="page">
      {/* Error state */}
      {isError && !isLoading && (
        <div className="alert alert-error">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Failed to load wallet data</strong>
            <p style={{ marginTop: 4, fontSize: '12px', opacity: 0.8 }}>
              {error?.message || 'Could not connect to opscan.org. Please check your connection and try again.'}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()} style={{ marginLeft: 'auto', flexShrink: 0 }}>
            Retry
          </button>
        </div>
      )}

      {/* Top cards row */}
      <div className="dashboard-top">
        <WalletInfoCard walletId={walletId} onRefresh={refetch} isRefreshing={isFetching} />
        <BalanceCard isLoading={isLoading} analytics={analytics} />
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div className="tabs" style={{ paddingLeft: '8px' }}>
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Tokens
            {analytics && <span className="badge badge-gray" style={{ marginLeft: 4 }}>{analytics.tokens.total}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
            {analytics && <span className="badge badge-gray" style={{ marginLeft: 4 }}>{analytics.transactions.total}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            🤖 AI Chat
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          {activeTab === 'overview' && (
            <TokensTable tokens={parsedData?.tokens ?? []} isLoading={isLoading} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsTable transactions={parsedData?.transactions ?? []} isLoading={isLoading} />
          )}
          {activeTab === 'chat' && (
            <ChatPanel walletId={walletId} parsedData={parsedData ?? null} />
          )}
        </div>
      </div>
    </main>
  );
}
