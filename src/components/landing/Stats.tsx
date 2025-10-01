'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Building2, DollarSign, Globe } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  delay?: number;
}

function StatCard({ icon: Icon, value, suffix, label, delay = 0 }: StatCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null;
      const duration = 2000; // 2 seconds

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="group"
    >
      <div className="relative p-8 bg-white border border-slate-200 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-4xl font-bold text-slate-900">
            {count.toLocaleString()}
            <span className="text-blue-600">{suffix}</span>
          </p>
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </motion.div>
  );
}

export function Stats() {
  const statsData = [
    {
      icon: Building2,
      value: 500,
      suffix: '+',
      label: 'Tour Operators',
      delay: 0
    },
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      label: 'Travel Agents',
      delay: 0.1
    },
    {
      icon: Globe,
      value: 50,
      suffix: '+',
      label: 'Countries',
      delay: 0.2
    },
    {
      icon: DollarSign,
      value: 2,
      suffix: 'M+',
      label: 'Revenue Generated',
      delay: 0.3
    }
  ];

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
            Trusted by Travel Professionals{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of tour operators and travel agents growing their business with our platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-12 border-t border-slate-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: '98%', label: 'Customer Satisfaction' },
              { value: '24/7', label: 'Support Available' },
              { value: '150K+', label: 'Bookings Processed' },
              { value: '<2min', label: 'Average Response Time' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}