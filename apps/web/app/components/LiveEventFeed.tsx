'use client';

import { useState, useEffect } from 'react';
import { formatUnits, Address } from 'viem';
import { useWatchFlipCreated, useWatchFlipAccepted, useWatchFlipResolved } from '@/hooks/useContractEvents';
import { FarcasterProfile } from './FarcasterProfile';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  type: 'created' | 'accepted' | 'resolved';
  timestamp: number;
  data: any;
}

export function LiveEventFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Watch for FlipCreated events
  useWatchFlipCreated((data) => {
    const event: Event = {
      id: `created-${data.flipId?.toString()}-${Date.now()}`,
      type: 'created',
      timestamp: Date.now(),
      data,
    };
    setEvents((prev) => [event, ...prev].slice(0, 10)); // Keep only last 10 events
  });

  // Watch for FlipAccepted events
  useWatchFlipAccepted((data) => {
    const event: Event = {
      id: `accepted-${data.flipId?.toString()}-${Date.now()}`,
      type: 'accepted',
      timestamp: Date.now(),
      data,
    };
    setEvents((prev) => [event, ...prev].slice(0, 10));
  });

  // Watch for FlipResolved events
  useWatchFlipResolved((data) => {
    const event: Event = {
      id: `resolved-${data.flipId?.toString()}-${Date.now()}`,
      type: 'resolved',
      timestamp: Date.now(),
      data,
    };
    setEvents((prev) => [event, ...prev].slice(0, 10));
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return '🎲';
      case 'accepted': return '🤝';
      case 'resolved': return '🎰';
      default: return '📢';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created': return 'border-blue-700 bg-blue-900/20';
      case 'accepted': return 'border-purple-700 bg-purple-900/20';
      case 'resolved': return 'border-green-700 bg-green-900/20';
      default: return 'border-gray-700 bg-gray-900/20';
    }
  };

  const formatEventText = (event: Event) => {
    const betAmount = event.data.betAmount ? formatUnits(event.data.betAmount, 6) : '0';

    switch (event.type) {
      case 'created':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <FarcasterProfile address={event.data.creator as Address} showAvatar={true} showUsername={false} size="sm" />
            <span className="text-gray-300">created a</span>
            <span className="font-bold text-blue-400">{betAmount} USDC</span>
            <span className="text-gray-300">challenge</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <FarcasterProfile address={event.data.opponent as Address} showAvatar={true} showUsername={false} size="sm" />
            <span className="text-gray-300">accepted the challenge</span>
          </div>
        );
      case 'resolved':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <FarcasterProfile address={event.data.winner as Address} showAvatar={true} showUsername={false} size="sm" />
            <span className="text-gray-300">won</span>
            <span className="font-bold text-green-400">{event.data.payout ? formatUnits(event.data.payout, 6) : '0'} USDC</span>
          </div>
        );
      default:
        return <span className="text-gray-300">Unknown event</span>;
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-2xl">📡</div>
          <h3 className="font-bold">Live Activity</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getEventIcon(event.type)}</div>
                    <div className="flex-1 min-w-0">
                      {formatEventText(event)}
                      <div className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(event.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
