'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Simple auth hook - replace with your actual Supabase auth later
function useSimpleAuth() {
  const signIn = async (email: string, password: string) => {
    try {
      // Mock login - replace with actual Supabase auth
      const mockUser = {
        email,
        role: email.includes('operator') ? 'TOUR_OPERATOR' : 
              email.includes('agent') ? 'TRAVEL_AGENT' : 
              email.includes('admin') ? 'ADMIN' : 'TOUR_OPERATOR',
        firstName: email.split('@')[0],
        lastName: 'User',
        name: email.split('@')[0] + ' User'
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token-' + Date.now());
      }
      
      return { 
        success: true, 
        data: { user: mockUser }
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Invalid credentials' 
      };
    }
  };

  return { signIn };
}

export function ModernLoginForm() {
  const router = useRouter();
  const { signIn } = useSimpleAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        // Redirect based on user role
        const role = result.data?.user?.role;
        if (role === 'TOUR_OPERATOR') {
          router.push('/operator');
        } else if (role === 'TRAVEL_AGENT') {
          router.push('/agent');
        } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Failed to sign in. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-slide-in-bottom">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Sign in failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            className={`pl-10 h-11 transition-smooth ${
              errors.email 
                ? 'border-red-300 focus-visible:ring-red-200' 
                : 'border-slate-200 focus-visible:ring-blue-200'
            }`}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            className={`pl-10 pr-10 h-11 transition-smooth ${
              errors.password 
                ? 'border-red-300 focus-visible:ring-red-200' 
                : 'border-slate-200 focus-visible:ring-blue-200'
            }`}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-soft hover:shadow-medium transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      {/* Demo Accounts */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">Or try demo accounts</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onSubmit({ email: 'operator@test.com', password: 'password123' })}
          className="text-xs"
        >
          Operator
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onSubmit({ email: 'agent@test.com', password: 'password123' })}
          className="text-xs"
        >
          Agent
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onSubmit({ email: 'admin@test.com', password: 'password123' })}
          className="text-xs"
        >
          Admin
        </Button>
      </div>
    </form>
  );
}