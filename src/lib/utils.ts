import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names with clsx
 * Useful for conditional styling and combining classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Utility function to create responsive class names
 * @param base - Base class name
 * @param responsive - Object with breakpoint-specific classes
 */
export function responsive(
  base: string,
  responsive: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  } = {}
) {
  const classes = [base];
  
  if (responsive.sm) classes.push(`sm:${responsive.sm}`);
  if (responsive.md) classes.push(`md:${responsive.md}`);
  if (responsive.lg) classes.push(`lg:${responsive.lg}`);
  if (responsive.xl) classes.push(`xl:${responsive.xl}`);
  
  return clsx(classes);
}

/**
 * Utility function to create variant-based class names
 * @param base - Base class name
 * @param variants - Object with variant-specific classes
 * @param variant - Current variant
 */
export function variant<T extends Record<string, string>>(
  base: string,
  variants: T,
  variant: keyof T
) {
  return clsx(base, variants[variant]);
}
