'use client';

import { cn } from '@/lib/utils';
import { Select as BaseSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Select = ({ 
  className, 
  value, 
  onChange, 
  options, 
  placeholder, 
  error, 
  disabled
}: SelectProps) => {
  return (
    <BaseSelect value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn(
        error && "border-red-500 focus:ring-red-500",
        className
      )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </BaseSelect>
  );
};