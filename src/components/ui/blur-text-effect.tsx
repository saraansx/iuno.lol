'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BlurTextEffectProps {
  children: string;
  className?: string;
}

export const BlurTextEffect: React.FC<BlurTextEffectProps> = ({ children, className = '' }) => {
  let charIndex = 0;

  return (
    <span className={`inline-block ${className}`}>
      {children.split(' ').map((word, wi) => (
        <React.Fragment key={wi}>
          {wi > 0 ? ' ' : null}
          <span className="inline-block" style={{ whiteSpace: 'nowrap' }}>
            {word.split('').map((char) => {
              const i = charIndex++;
              return (
                <motion.span
                  key={`${char}-${i}`}
                  className="inline-block"
                  style={{ whiteSpace: 'pre' }}
                  initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3, delay: i * 0.015, ease: 'easeOut' }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
};
