import { useState } from 'react';
import { Wallet, Plus, Menu } from 'lucide-react';
import AddWalletModal from '../WalletManager/AddWalletModal';
import NetworkSelector from '../WalletManager/NetworkSelector';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <header className="header">
        {/* Mobile menu button */}
        <button className="btn btn-ghost btn-icon menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={20} />
        </button>

        {/* Logo */}
        <a href="/" className="header-logo">
          <div className="header-logo-icon">₿</div>
          <div className="header-logo-text">
            <span>OP_NET</span> Wallet Copilot
          </div>
        </a>

        <div className="header-spacer" />

        <div className="header-actions">
          <NetworkSelector />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            Add wallet
          </button>
        </div>
      </header>

      {showAddModal && <AddWalletModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
