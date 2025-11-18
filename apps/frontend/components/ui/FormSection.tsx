import { ReactNode } from 'react';
import Card from './Card';

export default function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="mb-3 text-lg font-semibold text-brand-text">{title}</div>
      {children}
    </Card>
  );
}