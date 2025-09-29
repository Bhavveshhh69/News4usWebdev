import React, { useEffect, useState } from 'react';

export interface Slide {
  image: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

interface HeroCarouselProps {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  intervalMs = 5000,
  className,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides, intervalMs]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className={`relative h-64 md:h-96 lg:h-[28rem] overflow-hidden rounded-lg ${className ?? ''}`}>
      {slides.map((slide, idx) => (
        <a
          key={idx}
          href={slide.href || '#'}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-label={slide.title}
        >
          <img src={slide.image} alt={slide.title || 'slide'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 text-white">
            {slide.title && <h2 className="text-2xl md:text-4xl font-extrabold drop-shadow">{slide.title}</h2>}
            {slide.subtitle && <p className="mt-2 text-sm md:text-base opacity-90 drop-shadow">{slide.subtitle}</p>}
          </div>
        </a>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`h-1.5 w-6 rounded-full transition-all ${idx === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;


