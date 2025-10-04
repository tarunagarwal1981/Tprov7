'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, User, UserCheck } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.enum(['TOUR_OPERATOR', 'TRAVEL_AGENT'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Simple auth hook - replace with your actual Supabase auth later
function useSimpleAuth() {
  const signUp = async (userData: RegisterFormData) => {
    try {
      // Mock registration - replace with actual Supabase auth
      const mockUser = {
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`
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
        error: 'Registration failed' 
      };
    }
  };

  return { signUp };
}

export function ModernRegisterForm() {
  const router = useRouter();
  const { signUp } = useSimpleAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp(data);
      
      if (result.success) {
        // Redirect based on user role
        const role = result.data?.user?.role;
        if (role === 'TOUR_OPERATOR') {
          router.push('/operator');
        } else if (role === 'TRAVEL_AGENT') {
          router.push('/agent');
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Failed to register. Please try again.');
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
            <p className="text-sm font-medium text-red-900">Registration failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
            First name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              disabled={isLoading}
              className={`pl-10 h-11 transition-smooth ${
                errors.firstName 
                  ? 'border-red-300 focus-visible:ring-red-200' 
                  : 'border-slate-200 focus-visible:ring-blue-200'
              }`}
              {...register('firstName')}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
            Last name
          </Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              disabled={isLoading}
              className={`pl-10 h-11 transition-smooth ${
                errors.lastName 
                  ? 'border-red-300 focus-visible:ring-red-200' 
                  : 'border-slate-200 focus-visible:ring-blue-200'
              }`}
              {...register('lastName')}
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

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

      {/* Role Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">
          I am a...
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative">
            <input
              type="radio"
              value="TOUR_OPERATOR"
              disabled={isLoading}
              className="sr-only peer"
              {...register('role')}
            />
            <div className="p-3 border-2 border-slate-200 rounded-lg cursor-pointer transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-slate-300">
              <div className="text-sm font-medium text-slate-900">Tour Operator</div>
              <div className="text-xs text-slate-500 mt-1">Create and manage travel packages</div>
            </div>
          </label>
          <label className="relative">
            <input
              type="radio"
              value="TRAVEL_AGENT"
              disabled={isLoading}
              className="sr-only peer"
              {...register('role')}
            />
            <div className="p-3 border-2 border-slate-200 rounded-lg cursor-pointer transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-slate-300">
              <div className="text-sm font-medium text-slate-900">Travel Agent</div>
              <div className="text-xs text-slate-500 mt-1">Book packages for clients</div>
            </div>
          </label>
        </div>
        {errors.role && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            autoComplete="new-password"
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
          Confirm password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={isLoading}
            className={`pl-10 pr-10 h-11 transition-smooth ${
              errors.confirmPassword 
                ? 'border-red-300 focus-visible:ring-red-200' 
                : 'border-slate-200 focus-visible:ring-blue-200'
            }`}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {errors.confirmPassword.message}
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
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}
