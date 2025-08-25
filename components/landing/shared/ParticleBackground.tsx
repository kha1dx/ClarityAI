'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  speed: number;
  direction: number;
  shape: 'circle' | 'star' | 'diamond';
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#ffffff'];
    const shapes: Particle['shape'][] = ['circle', 'star', 'diamond'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 15 + 8,
        delay: Math.random() * 5,
        speed: Math.random() * 0.5 + 0.2,
        direction: Math.random() * Math.PI * 2,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }

    setParticles(newParticles);
    
    // Removed mouse tracking for performance
  }, []);
  
  if (!isMounted) return null;

  const renderShape = (particle: Particle) => {
    const baseStyle = {
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      backgroundColor: particle.color,
    };

    switch (particle.shape) {
      case 'star':
        return (
          <div
            className="flex items-center justify-center"
            style={{
              fontSize: `${particle.size}px`,
              color: particle.color,
            }}
          >
            ★
          </div>
        );
      case 'diamond':
        return <div className="transform rotate-45" style={baseStyle} />;
      default:
        return <div className="rounded-full" style={baseStyle} />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {renderShape(particle)}
        </motion.div>
      ))}
      
      {/* Static gradient orbs for atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-neon-purple/20 to-transparent blur-2xl opacity-40" />
      <div className="absolute top-2/3 right-1/4 w-56 h-56 rounded-full bg-gradient-to-l from-neon-blue/15 to-transparent blur-2xl opacity-30" />
      <div className="absolute top-1/2 left-2/3 w-32 h-32 rounded-full bg-gradient-to-r from-neon-cyan/20 to-transparent blur-xl opacity-35" />
    </div>
  );
}