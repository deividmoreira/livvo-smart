"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    // Do not show BottomNav on login or admin pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
        return null;
    }

    return (
        <nav className="bottom-nav glass-panel">
            <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                <Home size={24} strokeWidth={pathname === '/' ? 2.5 : 2} />
                <span>Início</span>
            </Link>

            <Link href="/corridas" className={`nav-item ${pathname.startsWith('/corridas') ? 'active' : ''}`}>
                <Compass size={24} strokeWidth={pathname.startsWith('/corridas') ? 2.5 : 2} />
                <span>Corridas</span>
            </Link>

            <Link href="/perfil" className={`nav-item ${pathname.startsWith('/perfil') ? 'active' : ''}`}>
                <User size={24} strokeWidth={pathname.startsWith('/perfil') ? 2.5 : 2} />
                <span>Perfil</span>
            </Link>
        </nav>
    );
}
