import { useState } from 'react';
import { X, Wallet, Link } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { getDefaultNetwork } from './NetworkSelector';
import type { Network } from '../../types';

interface AddWalletModalProps {
  onClose: () => void;
}

const NETWORKS: { value: Network; label: string }[] = [
  { value: 'mainnet', label: 'Mainnet' },
  { value: 'testnet', label: 'Testnet' },
  { value: 'regtest', label: 'Regtest' },
];

export default function AddWalletModal({ onClose }: AddWalletModalProps) {
  const { addWallet } = useWalletStore();
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [network, setNetwork] = useState<Network>(getDefaultNetwork());
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [tab, setTab] = useState<'manual' | 'connect'>('manual');

  const handleAdd = () => {
    const trimmed = address.trim();
    if (!trimmed) {
      setError('Please enter a wallet address');
      return;
    }
    if (trimmed.length < 10) {
      setError('Address seems too short');
      return;
    }
    addWallet(trimmed, network, label.trim() || undefined);
    onClose();
  };

  const handleConnectWallet = async () => {
    setConnecting(true);
    setError('');

    try {
      // Try OP Wallet / Unisat / generic Bitcoin wallet
      let addr: string | null = null;

      if (window.opnet?.requestAccounts) {
        const accounts = await window.opnet.requestAccounts();
        addr = accounts[0] || null;
      } else if (window.unisat?.requestAccounts) {
        const accounts = await window.unisat.requestAccounts();
        addr = accounts[0] || null;
        // Detect network from unisat
        const net = await window.unisat.getNetwork().catch(() => '');
        if (net.includes('test')) setNetwork('testnet');
        else if (net.includes('regtest')) setNetwork('regtest');
        else if (net.includes('mainnet') || net === 'livenet') setNetwork('mainnet');
      } else if (window.bitcoin?.connect) {
        const result = await window.bitcoin.connect();
        addr = result?.address || null;
      }

      if (addr) {
        addWallet(addr, network, 'Connected Wallet');
        onClose();
      } else {
        setError('No wallet found. Try adding the address manually.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(msg.includes('rejected') ? 'Connection rejected by user' : `Error: ${msg}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="modal-title">Add Wallet</h2>
            <p className="modal-subtitle" style={{ marginBottom: 0 }}>Connect or add a wallet address to view its data</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          <button className={`tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>
            <Wallet size={14} /> Manual Address
          </button>
          <button className={`tab ${tab === 'connect' ? 'active' : ''}`} onClick={() => setTab('connect')}>
            <Link size={14} /> Connect Wallet
          </button>
        </div>

        {tab === 'manual' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="card-label" style={{ marginBottom: '6px', display: 'block' }}>
                Wallet Address *
              </label>
              <input
                className="input"
                type="text"
                placeholder="bc1q... or bcrt1p..."
                value={address}
                onChange={(e) => { setAddress(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>

            <div>
              <label className="card-label" style={{ marginBottom: '6px', display: 'block' }}>
                Label (optional)
              </label>
              <input
                className="input"
                type="text"
                placeholder="My main wallet"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="card-label" style={{ marginBottom: '6px', display: 'block' }}>
                Network
              </label>
              <select
                className="input"
                value={network}
                onChange={(e) => setNetwork(e.target.value as Network)}
              >
                {NETWORKS.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="alert alert-error" style={{ padding: '10px 12px' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button className="btn btn-secondary w-full" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary w-full" onClick={handleAdd}>
                Add Wallet
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔗</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Supports <strong style={{ color: 'var(--text-primary)' }}>OP Wallet</strong>, UniSat, and compatible Bitcoin wallets.
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                This only reads your public address — no private keys or signing.
              </p>
            </div>

            <div>
              <label className="card-label" style={{ marginBottom: '6px', display: 'block', textAlign: 'left' }}>
                Network (after connect)
              </label>
              <select
                className="input"
                value={network}
                onChange={(e) => setNetwork(e.target.value as Network)}
              >
                {NETWORKS.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              className="btn btn-primary w-full"
              onClick={handleConnectWallet}
              disabled={connecting}
            >
              {connecting ? (
                <><div className="spinner" />Connecting...</>
              ) : (
                <><Link size={14} />Connect Wallet</>
              )}
            </button>

            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
