'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea as BaseTextarea } from '@/components/ui/textarea';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    return (
      <BaseTextarea
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

Textarea.displayName = "Textarea";