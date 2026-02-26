import { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import type { Network } from '../../types';

const NETWORKS: { value: Network; label: string; color: string }[] = [
  { value: 'mainnet', label: 'Mainnet', color: '#f7931a' },
  { value: 'testnet', label: 'Testnet', color: '#3b82f6' },
  { value: 'regtest', label: 'Regtest', color: '#a855f7' },
];

// Global default network (for new wallets)
let _defaultNetwork: Network = 'regtest';
export function getDefaultNetwork(): Network { return _defaultNetwork; }
export function setDefaultNetwork(n: Network): void { _defaultNetwork = n; }

export default function NetworkSelector() {
  const [open, setOpen] = useState(false);
  const { wallets, activeWalletId } = useWalletStore();
  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const current = NETWORKS.find((n) => n.value === (activeWallet?.network ?? _defaultNetwork)) ?? NETWORKS[2];

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setOpen(!open)}
        style={{ gap: '6px', fontSize: '12px' }}
      >
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: current.color,
          flexShrink: 0,
          display: 'inline-block',
        }} />
        {current.label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px',
            minWidth: '140px',
            zIndex: 100,
            boxShadow: 'var(--shadow)',
          }}>
            {NETWORKS.map((net) => (
              <button
                key={net.value}
                onClick={() => {
                  setDefaultNetwork(net.value);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: net.value === current.value ? 'var(--bg-card-hover)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  font: 'inherit',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: net.color,
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                {net.label}
                {net.value === current.value && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { NETWORKS };
