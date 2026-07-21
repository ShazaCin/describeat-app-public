import React, { useEffect, useRef, useState } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // seconds for full rotation
}

const MarqueeText: React.FC<MarqueeTextProps> = ({ text, className = '', speed = 15 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        setIsOverflowing(textWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const shouldAnimate = isOverflowing && (isHovered || isFocused);

  if (!isOverflowing) {
    return (
      <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
        <p ref={textRef} className="truncate">{text}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-marquee group cursor-default ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="marquee"
      aria-label={text}
    >
      <div
        className={`${shouldAnimate ? 'animate-marquee' : 'truncate'}`}
        style={{ animationDuration: shouldAnimate ? `${speed}s` : '0s' }}
      >
        <p ref={textRef} className={`inline-block whitespace-nowrap ${shouldAnimate ? 'px-4' : ''}`}>
          {text}
        </p>
        {shouldAnimate && (
          <p className="px-4 inline-block whitespace-nowrap" aria-hidden="true">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default MarqueeText;
