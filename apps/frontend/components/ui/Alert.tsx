import { HTMLAttributes } from 'react';
import { cn } from './utils';

type Variant = 'info' | 'success' | 'error';

export default function Alert({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const v = (rest as any).variant as Variant | undefined;
  const style = v === 'success' ? 'text-brand-accent' : v === 'error' ? 'text-brand-danger' : 'text-brand-textMuted';
  return <div className={cn('text-sm', style, className)} {...rest}>{children}</div>;
}