import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-primary text-white shadow-soft hover:bg-blue-600',
  secondary: 'border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surfaceMuted',
  outline: 'border border-brand-border bg-transparent text-brand-text hover:bg-brand-primarySoft',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  ghost: 'bg-transparent text-brand-text hover:bg-brand-primarySoft',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = 'primary', size = 'md', className, ...props }, ref) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});

export default Button;