import { LabelHTMLAttributes } from 'react';
import { cn } from './utils';

export default function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  const { className, ...rest } = props;
  return <label className={cn('mb-1 block text-sm text-white/80', className)} {...rest} />;
}