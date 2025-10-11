'use client';

/**
 * Web3Inbox Notifications Hook
 * Uses @web3inbox/react and @walletconnect/notify-client for push notifications
 */
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useNotifications, useSubscribe, useUnsubscribe } from '@web3inbox/react';

export function useWeb3Notifications() {
  const { address } = useAccount();
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Get notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();

  // Subscribe to notifications
  const { subscribe, isLoading: subscribeLoading } = useSubscribe();

  // Unsubscribe from notifications
  const { unsubscribe, isLoading: unsubscribeLoading } = useUnsubscribe();

  useEffect(() => {
    // Auto-subscribe when wallet connects
    if (address && !isSubscribed && !subscribeLoading) {
      handleSubscribe();
    }
  }, [address]);

  const handleSubscribe = async () => {
    if (!address) return;

    try {
      await subscribe();
      setIsSubscribed(true);
      console.log('Subscribed to Web3Inbox notifications');
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      setIsSubscribed(false);
      console.log('Unsubscribed from Web3Inbox notifications');
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
    }
  };

  return {
    notifications,
    isSubscribed,
    isLoading: notificationsLoading || subscribeLoading || unsubscribeLoading,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe,
  };
}

export type NotificationType =
  | 'game_won'
  | 'game_lost'
  | 'streak_milestone'
  | 'referral_bonus'
  | 'daily_flip_ready';

/**
 * Helper to send notifications for game events
 */
export async function sendGameNotification(
  type: NotificationType,
  data: Record<string, any>
) {
  // This would integrate with your backend to send notifications via WalletConnect Notify API
  console.log('Game notification:', { type, data });

  // Example notification messages
  const messages = {
    game_won: `You won ${data.amount} ETH! 🎉`,
    game_lost: `Better luck next time! Try again to maintain your streak.`,
    streak_milestone: `Amazing! You've reached a ${data.streak}-day streak! 🔥`,
    referral_bonus: `You earned ${data.bonus} ETH from referrals! 💰`,
    daily_flip_ready: `Your daily free flip is ready! 🎲`,
  };

  return {
    type,
    message: messages[type],
    data,
    timestamp: Date.now(),
  };
}
