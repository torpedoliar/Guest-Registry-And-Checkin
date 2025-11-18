import { HTMLAttributes } from 'react';
import { cn } from './utils';

export default function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft', className)} {...rest} />;
}