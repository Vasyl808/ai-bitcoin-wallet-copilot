import { useState } from 'react';
import { Plus, X, Wallet } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import WalletItem from '../WalletManager/WalletItem';
import AddWalletModal from '../WalletManager/AddWalletModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { wallets } = useWalletStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-accent" style={{ color: 'var(--accent)' }} />
            <span className="sidebar-title">My Wallets</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ display: isOpen ? undefined : 'none' }}>
            <X size={16} />
          </button>
        </div>

        {/* Wallet list */}
        <div className="sidebar-wallets">
          {wallets.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center' }}>
              <p className="text-muted text-sm">No wallets added yet</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
                Add a wallet address to get started
              </p>
            </div>
          ) : (
            wallets.map((wallet) => (
              <WalletItem key={wallet.id} wallet={wallet} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="btn btn-secondary w-full"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            Add wallet address
          </button>
        </div>
      </aside>

      {showAddModal && <AddWalletModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
