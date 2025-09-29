import React from 'react';

interface BreakingTickerProps {
  items: string[];
  speedMs?: number;
  className?: string;
  ariaLabel?: string;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  items,
  speedMs = 25000,
  className,
  ariaLabel = 'Breaking news ticker'
}) => {
  const hasItems = Array.isArray(items) && items.length > 0;
  const trackItems = hasItems ? [...items, ...items] : [];

  return (
    <div
      className={`group overflow-hidden bg-red-600 text-white ${className ?? ''}`}
      role="marquee"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="relative">
        <div
          className="flex items-center whitespace-nowrap"
          style={{
            animationName: hasItems ? 'newsTickerScroll' as any : undefined,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDuration: `${speedMs}ms`,
            animationPlayState: 'running',
          }}
        >
          {trackItems.map((text, index) => (
            <span key={`${text}-${index}`} className="px-4 py-2 text-sm md:text-base">
              {text}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .group:hover div[style*="newsTickerScroll"] { animation-play-state: paused; }
        @keyframes newsTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default BreakingTicker;


