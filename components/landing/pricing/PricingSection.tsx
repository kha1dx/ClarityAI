'use client';

import { motion } from 'framer-motion';
import PricingCard from './PricingCard';

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: 'month',
    description: 'Perfect for individuals and small teams getting started with AI',
    features: [
      '10,000 API calls per month',
      'Basic AI models access',
      'Email support',
      'Community access',
      'Basic analytics',
      'Standard SLA'
    ],
    glowColor: 'cyan' as const,
  },
  {
    name: 'Professional',
    price: '$99',
    period: 'month',
    description: 'Advanced features for growing businesses and development teams',
    features: [
      '100,000 API calls per month',
      'All AI models including premium',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'Enhanced SLA',
      'Team collaboration tools',
      'Custom training data'
    ],
    isPopular: true,
    glowColor: 'purple' as const,
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: 'month',
    description: 'Full-scale solution for large organizations with custom needs',
    features: [
      'Unlimited API calls',
      'Custom AI model training',
      '24/7 dedicated support',
      'Advanced security features',
      'On-premise deployment',
      'Custom SLA',
      'White-label solutions',
      'Dedicated account manager'
    ],
    glowColor: 'blue' as const,
  },
];

export default function PricingSection() {
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
            Choose Your{' '}
            <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              AI Journey
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Flexible pricing plans designed to scale with your business needs
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              glowColor={plan.glowColor}
              delay={index * 0.2}
            />
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-purple rounded-full" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-blue rounded-full" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-cyan rounded-full" />
              <span>Cancel anytime</span>
            </div>
          </div>
          
          <p className="text-gray-300">
            Need a custom plan?{' '}
            <motion.a
              href="#contact"
              className="text-neon-purple hover:text-neon-blue transition-colors duration-300 underline"
              whileHover={{ scale: 1.05 }}
            >
              Contact our sales team
            </motion.a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}