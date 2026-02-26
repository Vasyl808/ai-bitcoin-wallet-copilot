import { useState } from 'react';
import { useWalletStore } from './store/walletStore';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import EmptyState from './components/EmptyState';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeWalletId } = useWalletStore();

  return (
    <div className="app">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left sidebar wallet manager */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {activeWalletId ? (
          <Dashboard walletId={activeWalletId} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
