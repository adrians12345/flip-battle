'use client';

/**
 * Transaction History Component
 * Uses WalletConnect Blockchain API to display transaction history
 */
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { blockchainApiService, type Transaction } from '@/lib/blockchain-api';
import { shortenAddress, weiToEth } from '@/lib/walletconnect-utils';

export function TransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadTransactions();
    }
  }, [address]);

  const loadTransactions = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const txs = await blockchainApiService.getTransactionHistory(address);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-center">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <button
          onClick={loadTransactions}
          className="px-3 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No transactions found</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-gray-400">
                      {shortenAddress(tx.hash)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        tx.status === 'success'
                          ? 'bg-green-900 text-green-300'
                          : tx.status === 'failed'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>From: {shortenAddress(tx.from)}</span>
                    <span className="mx-2">→</span>
                    <span>To: {shortenAddress(tx.to)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">
                    {weiToEth(tx.value)} ETH
                  </div>
                  <div className="text-xs text-gray-500">
                    Block #{tx.blockNumber}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(tx.timestamp * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
