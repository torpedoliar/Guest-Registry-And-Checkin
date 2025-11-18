import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from './utils';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const base = 'w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary';

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, className)} {...props} />;
});

export default Textarea;