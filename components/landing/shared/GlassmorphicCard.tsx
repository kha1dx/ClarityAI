'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: 'purple' | 'blue' | 'cyan';
}

export default function GlassmorphicCard({ 
  children, 
  className = '', 
  hover = true,
  glowColor = 'purple'
}: GlassmorphicCardProps) {
  const glowColors = {
    purple: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]',
    blue: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative backdrop-blur-md bg-white/10 border border-white/20 
        rounded-2xl p-6 overflow-hidden transition-all duration-300
        ${hover ? glowColors[glowColor] : ''}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-cyan/20 p-[1px] opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="h-full w-full rounded-2xl bg-black/50" />
      </div>
    </motion.div>
  );
}