"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuth(!!localStorage.getItem('token'));
    }
  }, [pathname]);

  // Sembunyikan nav pada layar display publik dan halaman login admin
  if (pathname?.startsWith('/show') || pathname === '/admin/login') return null;

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.push('/admin/login');
    }
  };

  const base = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border transition-colors";
  const linkCls = (href: string) => {
    const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return active
      ? `${base} bg-brand-primary text-white border-transparent shadow-soft`
      : `${base} bg-transparent text-brand-text border-brand-border hover:bg-brand-primarySoft hover:text-brand-text`;
  };

  return (
    <div className="w-full sticky top-0 z-40 border-b border-brand-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 text-sm text-brand-text">
        {/* Minimal mode on /checkin when not authenticated: only Check-in + Login */}
        {!isAuth && pathname?.startsWith('/checkin') ? (
          <>
            <Link className={linkCls('/checkin')} href="/checkin">Check-in</Link>
            <div className="ml-auto flex items-center gap-2">
              <Link className={linkCls('/admin/login')} href="/admin/login">Login</Link>
              <Link className={linkCls('/about')} href="/about">About</Link>
            </div>
          </>
        ) : (
          <>
            <Link className={linkCls('/show')} href="/show">Show</Link>
            <Link className={linkCls('/checkin')} href="/checkin">Check-in</Link>
            {isAuth && (
              <>
                <Link className={linkCls('/admin/dashboard')} href="/admin/dashboard">Dashboard</Link>
                <Link className={linkCls('/admin/guests')} href="/admin/guests">Guests</Link>
                <Link className={linkCls('/admin/guests/new')} href="/admin/guests/new">Add Guest</Link>
                <Link className={linkCls('/admin/settings/event')} href="/admin/settings/event">Settings</Link>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              {!isAuth ? (
                <Link className={linkCls('/admin/login')} href="/admin/login">Login</Link>
              ) : (
                <button
                  className="inline-flex items-center rounded-full border border-brand-border px-3 py-1 text-sm font-medium text-brand-text hover:bg-brand-primarySoft"
                  onClick={logout}
                >
                  Logout
                </button>
              )}
              <Link className={linkCls('/about')} href="/about">About</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
