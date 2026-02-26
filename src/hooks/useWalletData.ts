import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '../store/walletStore';
import { parseAddress } from '../modules/opscanParser';
import type { ParsedAddress } from '../types';

export function useWalletData(walletId: string | null) {
  const { wallets, updateWalletData } = useWalletStore();
  const wallet = wallets.find((w) => w.id === walletId);

  const query = useQuery<ParsedAddress, Error>({
    queryKey: ['wallet', wallet?.address, wallet?.network],
    queryFn: async () => {
      if (!wallet) throw new Error('No wallet selected');
      const data = await parseAddress(wallet.address, wallet.network);
      updateWalletData(wallet.id, data);
      return data;
    },
    enabled: !!wallet,
    staleTime: 60_000, // 1 minute
    retry: 2,
    retryDelay: 3000,
  });

  return {
    ...query,
    wallet,
    parsedData: wallet?.parsedData ?? query.data ?? null,
  };
}
