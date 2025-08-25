'use client';

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import GlassmorphicCard from '../shared/GlassmorphicCard';
import AnimatedButton from '../shared/AnimatedButton';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  glowColor?: 'purple' | 'blue' | 'cyan';
  delay?: number;
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  glowColor = 'purple',
  delay = 0
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      {/* Popular badge */}
      {isPopular && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-neon-purple to-neon-blue px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-1">
            <Star size={16} />
            Most Popular
          </div>
        </motion.div>
      )}

      <GlassmorphicCard 
        glowColor={glowColor} 
        className={`h-full ${isPopular ? 'scale-105 border-neon-purple/40' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <p className="text-gray-300 text-sm mb-4">{description}</p>
            
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-white">{price}</span>
              <span className="text-gray-400">/{period}</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex-grow mb-6">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: delay + 0.1 * index }}
                  className="flex items-start gap-3"
                >
                  <Check 
                    size={20} 
                    className={`${
                      glowColor === 'purple' ? 'text-neon-purple' :
                      glowColor === 'blue' ? 'text-neon-blue' : 'text-neon-cyan'
                    } flex-shrink-0 mt-0.5`} 
                  />
                  <span className="text-gray-300 text-sm leading-relaxed">
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <div className="mt-auto">
            <AnimatedButton
              variant={isPopular ? 'primary' : 'secondary'}
              className="w-full"
            >
              {isPopular ? 'Start Free Trial' : 'Get Started'}
            </AnimatedButton>
          </div>
        </div>

        {/* Animated border for popular plan */}
        {isPopular && (
          <div className="absolute inset-0 rounded-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan p-[2px] opacity-50"
            >
              <div className="h-full w-full rounded-2xl bg-black/50" />
            </motion.div>
          </div>
        )}
      </GlassmorphicCard>
    </motion.div>
  );
}