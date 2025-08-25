'use client';

import { motion } from 'framer-motion';
import FloatingCard from './FloatingCard';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'TechFlow',
    content: 'This AI platform transformed our development workflow. The integration was seamless and the results exceeded our expectations.',
    rating: 5,
    avatar: '/avatars/sarah.jpg'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Lead Engineer',
    company: 'InnovateAI',
    content: 'Outstanding performance and reliability. The API response times are incredibly fast and the documentation is excellent.',
    rating: 5,
    avatar: '/avatars/marcus.jpg'
  },
  {
    name: 'Emily Watson',
    role: 'Product Manager',
    company: 'FutureLogic',
    content: 'The customer support is phenomenal and the platform scales beautifully with our growing user base.',
    rating: 5,
    avatar: '/avatars/emily.jpg'
  },
  {
    name: 'David Kim',
    role: 'Founder',
    company: 'StartupAI',
    content: 'Game-changing technology that helped us launch our product 3 months ahead of schedule. Highly recommended!',
    rating: 5,
    avatar: '/avatars/david.jpg'
  },
  {
    name: 'Lisa Thompson',
    role: 'Data Scientist',
    company: 'AnalyticsPro',
    content: 'The AI models are incredibly accurate and the training capabilities have revolutionized our data analysis.',
    rating: 5,
    avatar: '/avatars/lisa.jpg'
  },
  {
    name: 'James Wilson',
    role: 'VP Engineering',
    company: 'CloudTech',
    content: 'Impressive enterprise features and security. Perfect for our large-scale deployment needs.',
    rating: 5,
    avatar: '/avatars/james.jpg'
  }
];

export default function TestimonialSection() {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
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
            Trusted by{' '}
            <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See what our customers say about their experience with our AI platform
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <FloatingCard
              key={testimonial.name}
              testimonial={testimonial}
              delay={index * 0.1}
              direction={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-neon-purple mb-2"
            >
              98%
            </motion.div>
            <p className="text-gray-400">Customer Satisfaction</p>
          </div>
          
          <div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-3xl md:text-4xl font-bold text-neon-blue mb-2"
            >
              500+
            </motion.div>
            <p className="text-gray-400">Enterprise Clients</p>
          </div>
          
          <div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-3xl md:text-4xl font-bold text-neon-cyan mb-2"
            >
              10M+
            </motion.div>
            <p className="text-gray-400">API Calls Daily</p>
          </div>
          
          <div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-3xl md:text-4xl font-bold text-neon-purple mb-2"
            >
              150+
            </motion.div>
            <p className="text-gray-400">Countries Served</p>
          </div>
        </motion.div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['TechFlow', 'InnovateAI', 'FutureLogic', 'StartupAI', 'AnalyticsPro', 'CloudTech'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                className="px-6 py-3 border border-white/10 rounded-lg backdrop-blur-sm text-white font-semibold"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}