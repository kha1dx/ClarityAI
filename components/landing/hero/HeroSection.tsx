'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import FloatingElements from './FloatingElements';
import AnimatedButton from '../shared/AnimatedButton';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <AnimatedBackground />
      <FloatingElements />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 backdrop-blur-sm"
          >
            <span className="text-sm text-neon-purple font-medium">
              🎯 AI-Powered Prompt Engineering
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
          >
            Transform Your Ideas Into{' '}
            <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
              Perfect Prompts
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Master the art of prompt engineering with AI-powered assistance. Create, optimize, and manage 
            prompts that deliver exceptional results across any language model.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a href="/auth/signup">
              <AnimatedButton size="lg" className="min-w-[200px]">
                Start Creating Prompts
                <ArrowRight size={20} />
              </AnimatedButton>
            </a>
            
            <a href="/auth/login">
              <AnimatedButton variant="ghost" size="lg" className="min-w-[200px]">
                <Play size={20} />
                Sign In
              </AnimatedButton>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neon-purple">50K+</div>
              <div className="text-gray-400 text-sm md:text-base">Prompts Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neon-blue">15+</div>
              <div className="text-gray-400 text-sm md:text-base">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neon-cyan">98%</div>
              <div className="text-gray-400 text-sm md:text-base">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
}