import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import AddWalletModal from './WalletManager/AddWalletModal';

export default function EmptyState() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">₿</div>
          <h1 className="empty-state-title">Welcome to OP_NET Wallet Copilot</h1>
          <p className="empty-state-subtitle">
            Add a Bitcoin or OP_NET wallet address to view your balance, tokens, transactions, and get AI-powered insights.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Wallet Address
            </button>
            <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
              <Wallet size={16} /> Connect OP Wallet
            </button>
          </div>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '40px',
            width: '100%',
            maxWidth: '700px',
          }}>
            {[
              { icon: '📊', title: 'Dashboard', desc: 'View BTC balance, token holdings, and transaction history' },
              { icon: '🤖', title: 'AI Analysis', desc: 'Get instant wallet analysis powered by Llama 3 via Groq' },
              { icon: '💬', title: 'AI Chat', desc: 'Ask questions about your wallet activity in plain English' },
              { icon: '🔄', title: 'Multi-wallet', desc: 'Track multiple addresses across all Bitcoin networks' },
            ].map((f) => (
              <div key={f.title} className="card" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '32px', maxWidth: '400px', textAlign: 'center' }}>
            Read-only access only. No private keys or signing required. Data fetched from opscan.org.
          </p>
        </div>
      </div>

      {showModal && <AddWalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
