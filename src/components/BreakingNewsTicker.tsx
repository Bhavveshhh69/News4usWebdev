import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useContent } from '../store/contentStore';

export function BreakingNewsTicker() {
  const { breakingItems, breakingSpeedMs, breakingPauseOnHover, articles } = useContent();

  const items = useMemo(() => {
    if (breakingItems && breakingItems.length > 0) return breakingItems;
    return [...articles]
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, 5)
      .map(a => a.title);
  }, [breakingItems, articles]);

  const durationSec = Math.max(8, Math.min(60, Math.round(breakingSpeedMs / 1000)));

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="flex items-center">
        <div className="bg-red-800 px-4 py-1 text-sm font-bold whitespace-nowrap">
          BREAKING NEWS
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: [1200, -1200] }}
            transition={{ duration: durationSec, repeat: Infinity, ease: 'linear' }}
            style={{ pointerEvents: 'auto' }}
            onMouseEnter={(e) => { if (breakingPauseOnHover) (e.currentTarget as any).style.animationPlayState = 'paused'; }}
            onMouseLeave={(e) => { if (breakingPauseOnHover) (e.currentTarget as any).style.animationPlayState = 'running'; }}
          >
            {items.map((news, index) => (
              <span key={index} className="mx-8 text-sm">
                • {news}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}