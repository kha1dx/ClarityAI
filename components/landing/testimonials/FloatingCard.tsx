'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import GlassmorphicCard from '../shared/GlassmorphicCard';
import Image from 'next/image';

interface FloatingCardProps {
  testimonial: {
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    avatar: string;
  };
  delay?: number;
  direction?: 'left' | 'right';
}

export default function FloatingCard({ 
  testimonial, 
  delay = 0, 
  direction = 'left' 
}: FloatingCardProps) {
  const { name, role, company, content, rating, avatar } = testimonial;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: direction === 'left' ? -100 : 100,
        y: 50 
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="w-full max-w-md"
    >
      <GlassmorphicCard className="relative">
        {/* Quote Icon */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center">
          <Quote size={16} className="text-white" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${
                i < rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          className="text-gray-300 mb-6 leading-relaxed"
        >
          "{content}"
        </motion.p>

        {/* Author */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-neon-purple/30">
            <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center text-white font-semibold">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold">{name}</h4>
            <p className="text-gray-400 text-sm">{role} at {company}</p>
          </div>
        </motion.div>

        {/* Animated border */}
        <motion.div
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/20 via-transparent to-neon-blue/20 pointer-events-none"
        />
      </GlassmorphicCard>
    </motion.div>
  );
}