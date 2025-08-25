'use client';

import { motion } from 'framer-motion';
import { Brain, Cpu, Zap, Shield, Rocket, Stars } from 'lucide-react';

const floatingElements = [
  { Icon: Brain, position: 'top-20 left-20', delay: 0, color: 'text-neon-purple' },
  { Icon: Cpu, position: 'top-32 right-24', delay: 1, color: 'text-neon-blue' },
  { Icon: Zap, position: 'bottom-40 left-32', delay: 2, color: 'text-neon-cyan' },
  { Icon: Shield, position: 'bottom-24 right-40', delay: 3, color: 'text-neon-purple' },
  { Icon: Rocket, position: 'top-1/2 left-12', delay: 4, color: 'text-neon-blue' },
  { Icon: Stars, position: 'top-1/3 right-16', delay: 5, color: 'text-neon-cyan' },
];

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {floatingElements.map(({ Icon, position, delay, color }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} ${color} opacity-20 hover:opacity-60 transition-opacity duration-300`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.2, 0.6, 0.2], 
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            delay: delay * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={24} />
        </motion.div>
      ))}
      
      {/* Animated connecting lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.path
          d="M 100 100 Q 200 50 300 100 T 500 100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 200 200 Q 300 150 400 200 T 600 200"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}