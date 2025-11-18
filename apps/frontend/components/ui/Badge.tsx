import { HTMLAttributes } from 'react';
import { cn } from './utils';

type Variant = 'neutral' | 'success' | 'warning' | 'danger';

export default function Badge({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const v = (rest as any).variant as Variant | undefined;
  const style = v === 'success' ? 'bg-emerald-50 text-emerald-700' : v === 'warning' ? 'bg-amber-50 text-amber-700' : v === 'danger' ? 'bg-red-50 text-red-700' : 'bg-brand-primarySoft text-brand-text';
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', style, className)} {...rest}>{children}</span>;
}