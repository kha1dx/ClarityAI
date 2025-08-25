'use client';

import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Lightbulb, 
  FileText, 
  History, 
  Cpu, 
  Download 
} from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: MessageSquare,
    title: 'Intelligent Conversation',
    description: 'AI that understands context and helps craft prompts that get better results from any language model.',
    glowColor: 'purple' as const,
  },
  {
    icon: Lightbulb,
    title: 'Smart Optimization',
    description: 'Automatic prompt enhancement with AI-powered suggestions to improve clarity and effectiveness.',
    glowColor: 'blue' as const,
  },
  {
    icon: FileText,
    title: 'Template Library',
    description: 'Pre-built prompt templates for common tasks, from creative writing to data analysis.',
    glowColor: 'cyan' as const,
  },
  {
    icon: History,
    title: 'History Tracking',
    description: 'Save, organize, and reuse your best prompts with version control and performance tracking.',
    glowColor: 'purple' as const,
  },
  {
    icon: Cpu,
    title: 'Multi-Model Support',
    description: 'Works seamlessly with GPT, Claude, Gemini, and other leading AI models for maximum flexibility.',
    glowColor: 'blue' as const,
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download prompts in multiple formats or integrate directly with your existing AI workflows.',
    glowColor: 'cyan' as const,
  },
];

export default function FeatureGrid() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              Perfect Prompts
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional prompt engineering tools that help you get exceptional results from any AI model
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              glowColor={feature.glowColor}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-300 mb-8">
            Ready to create prompts that deliver better results? Join thousands of creators already using Prompt Studio.
          </p>
          <a href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-neon-purple/30 transition-all duration-300"
            >
              Start Creating Prompts
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}