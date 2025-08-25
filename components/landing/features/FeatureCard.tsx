'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import GlassmorphicCard from '../shared/GlassmorphicCard';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  glowColor?: 'purple' | 'blue' | 'cyan';
  delay?: number;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  glowColor = 'purple',
  delay = 0 
}: FeatureCardProps) {
  const iconColors = {
    purple: 'text-neon-purple',
    blue: 'text-neon-blue',
    cyan: 'text-neon-cyan'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <GlassmorphicCard glowColor={glowColor} className="h-full">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon with animated background */}
          <div className="relative">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className={`p-4 rounded-2xl bg-gradient-to-br from-${glowColor === 'purple' ? 'neon-purple' : glowColor === 'blue' ? 'neon-blue' : 'neon-cyan'}/20 to-transparent border border-white/10`}
            >
              <Icon size={32} className={iconColors[glowColor]} />
            </motion.div>
            
            {/* Animated glow effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`absolute inset-0 rounded-2xl bg-${glowColor === 'purple' ? 'neon-purple' : glowColor === 'blue' ? 'neon-blue' : 'neon-cyan'}/20 blur-md -z-10`}
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">
              {title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
            className={`h-[2px] bg-gradient-to-r from-transparent via-${glowColor === 'purple' ? 'neon-purple' : glowColor === 'blue' ? 'neon-blue' : 'neon-cyan'} to-transparent`}
          />
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
}