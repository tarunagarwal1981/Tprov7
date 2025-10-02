'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

interface FormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  description, 
  required = false, 
  error, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <FormItem className={cn("space-y-2", className)}>
      <FormLabel className={cn("text-sm font-medium", required && "after:content-['*'] after:ml-1 after:text-red-500")}>
        {label}
      </FormLabel>
      {description && (
        <FormDescription className="text-xs text-gray-500">
          {description}
        </FormDescription>
      )}
      <FormControl>
        {children}
      </FormControl>
      {error && (
        <FormMessage className="text-xs text-red-600">
          {error}
        </FormMessage>
      )}
    </FormItem>
  );
}