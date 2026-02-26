import { useState } from 'react';
import { Trash2, Radio, Unplug } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import type { WalletEntry } from '../../types';

interface WalletItemProps {
  wallet: WalletEntry;
}

const NETWORK_COLORS: Record<string, string> = {
  mainnet: '#f7931a',
  testnet: '#3b82f6',
  regtest: '#a855f7',
};

export default function WalletItem({ wallet }: WalletItemProps) {
  const { activeWalletId, setActiveWallet, removeWallet } = useWalletStore();
  const isActive = activeWalletId === wallet.id;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      removeWallet(wallet.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveWallet(null);
  };

  const initial = wallet.address.slice(0, 2).toUpperCase();

  return (
    <div
      className={`wallet-item ${isActive ? 'active' : ''}`}
      onClick={() => setActiveWallet(wallet.id)}
      title={wallet.address}
    >
      <div className="wallet-item-avatar">{initial}</div>

      <div className="wallet-item-info">
        <div className="wallet-item-label">{wallet.label}</div>
        <div className="wallet-item-address">{wallet.address}</div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="wallet-item-network"
            style={{ color: NETWORK_COLORS[wallet.network] }}
          >
            {wallet.network}
          </span>
          {isActive && <span className="wallet-item-badge">● Active</span>}
        </div>
      </div>

      <div className="wallet-item-actions" onClick={(e) => e.stopPropagation()}>
        {isActive && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={handleDisconnect}
            title="Disconnect wallet (keep in list)"
          >
            <Unplug size={12} />
          </button>
        )}
        <button
          className={`btn btn-xs ${confirmDelete ? 'btn-danger' : 'btn-ghost'}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Remove wallet'}
        >
          {confirmDelete ? 'Sure?' : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
}
