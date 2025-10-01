'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Package, 
  Network, 
  Check,
  Zap,
  Shield,
  BarChart3,
  Headphones
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  delay?: number;
  gradient: string;
}

function FeatureCard({ icon: Icon, title, description, benefits, delay = 0, gradient }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group h-full"
    >
      <div className="relative h-full p-8 bg-white border border-slate-200 rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">
        {/* Icon with gradient background */}
        <div className={`inline-flex p-3 rounded-xl ${gradient} mb-6 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>

        {/* Benefits List */}
        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-slate-700 leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </motion.div>
  );
}

export function Features() {
  const mainFeatures = [
    {
      icon: Sparkles,
      title: 'AI Lead Generation',
      description: 'Harness the power of AI to automatically generate and qualify high-quality travel leads from multiple sources.',
      benefits: [
        'Automated lead sourcing from social media',
        'Smart lead scoring and qualification',
        'Voice agent verification system',
        'Real-time lead notifications'
      ],
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: Package,
      title: 'Smart Package Management',
      description: 'Create, manage, and distribute travel packages with ease. Connect with operators and agents worldwide.',
      benefits: [
        'Intuitive package creation tools',
        'Multi-city itinerary builder',
        'Dynamic pricing management',
        'Inventory tracking and updates'
      ],
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      icon: Network,
      title: 'Global Network',
      description: 'Connect with thousands of tour operators and travel agents across 50+ countries for unlimited opportunities.',
      benefits: [
        'Access to verified operators',
        'Direct agent connections',
        'Commission tracking system',
        'Secure payment processing'
      ],
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: 'Automated Workflows',
      description: 'Save time with intelligent automation'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security for your data'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time insights and reporting'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Always here to help you succeed'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Grow Your Business
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed specifically for tour operators and travel agents
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-7xl mx-auto">
          {mainFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <feature.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}