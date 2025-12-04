import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from './utils';

type Variant = 'default' | 'glass';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: Variant;
}

const base = 'w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary';

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({ className, variant = 'default', ...props }, ref) {
  const style = variant === 'glass' ? 'glass-input' : base;
  return <textarea ref={ref} className={cn(style, className)} {...props} />;
});

export default Textarea;