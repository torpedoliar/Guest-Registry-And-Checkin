import { HTMLAttributes } from 'react';
import { cn } from './utils';

type Variant = 'solid' | 'glass';

export default function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const v = (rest as any).variant as Variant | undefined;
  const base = v === 'glass'
    ? 'glass-card p-5'
    : 'rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft';
  return <div className={cn(base, className)} {...rest} />;
}