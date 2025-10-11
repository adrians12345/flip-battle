/**
 * WalletConnect Analytics Integration
 * Track wallet connections and interactions for Builder Score
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class WalletConnectAnalytics {
  private events: AnalyticsEvent[] = [];
  private projectId: string;

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
  }

  /**
   * Track wallet connection event
   */
  trackWalletConnection(address: string, chainId: number) {
    this.track('wallet_connected', {
      address,
      chainId,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Wallet connected', { address, chainId });
  }

  /**
   * Track wallet disconnection event
   */
  trackWalletDisconnection(address: string) {
    this.track('wallet_disconnected', {
      address,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Wallet disconnected', { address });
  }

  /**
   * Track transaction event
   */
  trackTransaction(hash: string, type: string, value?: string) {
    this.track('transaction', {
      hash,
      type,
      value,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Transaction', { hash, type, value });
  }

  /**
   * Track game event
   */
  trackGameEvent(eventType: string, data: Record<string, any>) {
    this.track(`game_${eventType}`, {
      ...data,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Game event', { eventType, data });
  }

  /**
   * Track session proposal
   */
  trackSessionProposal(proposalId: number, accepted: boolean) {
    this.track('session_proposal', {
      proposalId,
      accepted,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Session proposal', { proposalId, accepted });
  }

  /**
   * Track signing event
   */
  trackSigning(type: 'message' | 'transaction' | 'typed_data', success: boolean) {
    this.track('signing', {
      type,
      success,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Signing', { type, success });
  }

  /**
   * Track chain switch
   */
  trackChainSwitch(fromChainId: number, toChainId: number) {
    this.track('chain_switch', {
      fromChainId,
      toChainId,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Chain switch', { fromChainId, toChainId });
  }

  /**
   * Track notification subscription
   */
  trackNotificationSubscription(subscribed: boolean) {
    this.track('notification_subscription', {
      subscribed,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Notification subscription', { subscribed });
  }

  /**
   * Track Web3Inbox usage
   */
  trackWeb3InboxUsage(action: 'open' | 'close' | 'read') {
    this.track('web3inbox_usage', {
      action,
      timestamp: Date.now(),
    });

    console.log('WalletConnect Analytics: Web3Inbox usage', { action });
  }

  /**
   * Generic tracking method
   */
  private track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events.shift();
    }

    // Send to analytics endpoint if available
    this.sendToAnalytics(event);
  }

  /**
   * Send event to analytics endpoint
   */
  private async sendToAnalytics(event: AnalyticsEvent) {
    if (!this.projectId) return;

    try {
      // This would integrate with WalletConnect's analytics API
      // For now, we just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event);
      }

      // In production, send to analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Get event count by name
   */
  getEventCount(name: string): number {
    return this.events.filter(e => e.name === name).length;
  }

  /**
   * Get total interaction count
   */
  getTotalInteractions(): number {
    return this.events.length;
  }
}

// Singleton instance
export const walletConnectAnalytics = new WalletConnectAnalytics();
