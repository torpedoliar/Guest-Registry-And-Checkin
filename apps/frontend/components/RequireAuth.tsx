"use client";
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { getToken } from '../lib/api';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const t = getToken();
    if (!t) router.replace('/admin/login');
  }, [router]);
  return <>{children}</>;
}
