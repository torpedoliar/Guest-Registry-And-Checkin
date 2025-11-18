import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from './utils';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {}

const base = 'w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary';

export const Select = forwardRef<HTMLSelectElement, Props>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(base, className)} {...props} />;
});

export default Select;