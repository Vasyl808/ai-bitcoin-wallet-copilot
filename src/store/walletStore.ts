import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletEntry, WalletStore, Network, ParsedAddress, ChatMessage } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: [],
      activeWalletId: null,
      chatHistories: {},

      addWallet: (address: string, network: Network, label?: string): WalletEntry => {
        const existing = get().wallets.find(
          (w) => w.address.toLowerCase() === address.toLowerCase() && w.network === network
        );
        if (existing) {
          // If already exists, just make it active
          set({ activeWalletId: existing.id });
          return existing;
        }

        const entry: WalletEntry = {
          id: generateId(),
          address,
          label: label || `${address.slice(0, 8)}...${address.slice(-6)}`,
          network,
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          wallets: [...state.wallets, entry],
          activeWalletId: entry.id,
        }));

        return entry;
      },

      removeWallet: (id: string) => {
        set((state) => {
          const newWallets = state.wallets.filter((w) => w.id !== id);
          const newChatHistories = { ...state.chatHistories };
          delete newChatHistories[id];

          let newActiveId = state.activeWalletId;
          if (state.activeWalletId === id) {
            newActiveId = newWallets.length > 0 ? newWallets[newWallets.length - 1].id : null;
          }

          return {
            wallets: newWallets,
            activeWalletId: newActiveId,
            chatHistories: newChatHistories,
          };
        });
      },

      setActiveWallet: (id: string | null) => {
        set({ activeWalletId: id });
      },

      updateWalletData: (id: string, data: ParsedAddress) => {
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === id
              ? { ...w, parsedData: data, lastFetched: new Date().toISOString() }
              : w
          ),
        }));
      },

      addChatMessage: (walletId: string, message: ChatMessage) => {
        set((state) => ({
          chatHistories: {
            ...state.chatHistories,
            [walletId]: [...(state.chatHistories[walletId] || []), message],
          },
        }));
      },

      clearChatHistory: (walletId: string) => {
        set((state) => ({
          chatHistories: {
            ...state.chatHistories,
            [walletId]: [],
          },
        }));
      },

      getActiveWallet: () => {
        const state = get();
        if (!state.activeWalletId) return null;
        return state.wallets.find((w) => w.id === state.activeWalletId) || null;
      },
    }),
    {
      name: 'op-net-wallet-copilot',
      // Only persist wallets list and activeWalletId (not full parsed data to save space)
      partialize: (state) => ({
        wallets: state.wallets.map((w) => ({
          ...w,
          parsedData: undefined, // don't persist large parsed data
        })),
        activeWalletId: state.activeWalletId,
        chatHistories: state.chatHistories,
      }),
    }
  )
);
