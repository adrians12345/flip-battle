'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinFlipAnimationProps {
  result?: 'heads' | 'tails';
  isFlipping: boolean;
  onFlipComplete?: () => void;
}

export function CoinFlipAnimation({ result, isFlipping, onFlipComplete }: CoinFlipAnimationProps) {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isFlipping && result) {
      // Show result after animation completes
      const timer = setTimeout(() => {
        setShowResult(true);
        onFlipComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [isFlipping, result, onFlipComplete]);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isFlipping ? (
          <motion.div
            key="flipping"
            className="coin relative w-32 h-32"
            initial={{ rotateY: 0 }}
            animate={{
              rotateY: 1080, // 3 full rotations
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            }}
          >
            {/* Coin Front (Heads) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl flex items-center justify-center backface-hidden">
              <div className="text-6xl">🪙</div>
            </div>
            {/* Coin Back (Tails) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-2xl flex items-center justify-center backface-hidden rotate-y-180">
              <div className="text-6xl rotate-y-180">🪙</div>
            </div>
          </motion.div>
        ) : result && showResult ? (
          <motion.div
            key="result"
            initial={{ scale: 0, rotateY: 0 }}
            animate={{
              scale: 1,
              rotateY: result === 'tails' ? 180 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="relative"
          >
            <motion.div
              className={`w-40 h-40 rounded-full shadow-2xl flex items-center justify-center ${
                result === 'heads'
                  ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
              }`}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(234, 179, 8, 0.5)',
                  '0 0 40px rgba(234, 179, 8, 0.8)',
                  '0 0 20px rgba(234, 179, 8, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="text-7xl">🪙</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            >
              <div className={`text-2xl font-bold ${
                result === 'heads' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {result === 'heads' ? 'HEADS' : 'TAILS'}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 shadow-xl flex items-center justify-center border-4 border-gray-600"
          >
            <div className="text-6xl opacity-50">🪙</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle effects during flip */}
      {isFlipping && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-400"
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
              }}
              animate={{
                x: `${50 + Math.cos((i * Math.PI) / 4) * 100}%`,
                y: `${50 + Math.sin((i * Math.PI) / 4) * 100}%`,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
