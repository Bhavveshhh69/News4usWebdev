import React, { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade';

interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  once?: boolean;
  className?: string;
  direction?: Direction;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delayMs = 0,
  once = true,
  className,
  direction = 'up',
  threshold = 0.12,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = window.setTimeout(() => setIsVisible(true), delayMs);
            if (once) observer.disconnect();
            return () => window.clearTimeout(id);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs, once, threshold]);

  const base = 'transition-all duration-700 ease-out will-change-transform will-change-opacity';
  const hidden = 'opacity-0';
  const shown = 'opacity-100 translate-x-0 translate-y-0';
  const dirMap: Record<Direction, string> = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    fade: '',
  };

  return (
    <div
      ref={containerRef}
      className={`${base} ${isVisible ? shown : `${hidden} ${dirMap[direction]}`} ${className ?? ''}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;


