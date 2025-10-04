'use client';

import React from 'react';
import Link from 'next/link';
import { Plane } from 'lucide-react';
import { ModernLoginForm } from '@/components/auth/ModernLoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center justify-center space-x-2 group">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl transition-transform group-hover:scale-105 shadow-soft">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TravelPro
              </span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
              <p className="text-slate-600 mt-2">Sign in to access your dashboard</p>
            </div>
          </div>

          {/* Login Form */}
          <ModernLoginForm />

          {/* Register Link */}
          <div className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/register" 
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Trusted by 10,000+ agents</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Manage your travel business with confidence
            </h2>
            <p className="text-lg text-blue-100">
              Access powerful tools for lead generation, package management, and booking automation—all in one platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'AI-powered lead generation',
              'Real-time booking management',
              'Global operator network',
              'Automated workflows'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-blue-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}