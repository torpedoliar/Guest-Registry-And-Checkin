import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from './utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

const base = 'w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary';

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, className)} {...props} />;
});

export default Input;