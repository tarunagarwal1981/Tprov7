'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input as BaseInput } from '@/components/ui/input';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, error, ...props }, ref) => {
    return (
      <BaseInput
        type={type}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";