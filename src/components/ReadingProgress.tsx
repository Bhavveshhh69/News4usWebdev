import React, { useEffect, useState } from 'react';

interface ReadingProgressProps {
  className?: string;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({ className }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const value = max > 0 ? (window.scrollY / max) * 100 : 0;
      setPercent(Math.max(0, Math.min(100, value)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className ?? ''}`} aria-hidden>
      <div className="h-1 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-red-600 transition-[width] duration-150"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ReadingProgress;


