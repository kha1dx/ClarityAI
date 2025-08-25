import HeroSection from '@/components/landing/hero/HeroSection';
import FeatureGrid from '@/components/landing/features/FeatureGrid';
import PricingSection from '@/components/landing/pricing/PricingSection';
import TestimonialSection from '@/components/landing/testimonials/TestimonialSection';
import ParticleBackground from '@/components/landing/shared/ParticleBackground';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-futuristic-gradient font-inter overflow-x-hidden">
      {/* Background Effects - Simplified */}
      <ParticleBackground />
      
      {/* Page Sections */}
      <HeroSection />
      <FeatureGrid />
      <TestimonialSection />
      <PricingSection />
      
      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-4">
                Prompt Studio
              </h3>
              <p className="text-gray-400">
                Transform your ideas into perfect prompts with AI-powered precision.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-neon-blue transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-neon-blue transition-colors">Pricing</a></li>
                <li><a href="#api" className="hover:text-neon-blue transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-neon-purple transition-colors">About</a></li>
                <li><a href="#blog" className="hover:text-neon-purple transition-colors">Blog</a></li>
                <li><a href="#careers" className="hover:text-neon-purple transition-colors">Career</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-gray-400">
              © 2024 Prompt Studio. All rights reserved. Built with 
              <span className="text-neon-purple"> Next.js</span> and 
              <span className="text-neon-blue"> Tailwind CSS</span>.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}