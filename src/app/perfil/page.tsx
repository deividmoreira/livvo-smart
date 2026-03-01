"use client";

import { useState } from 'react';
import { User, LogOut, Settings, Award } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user] = useState({
        name: 'Usuário Demo',
        email: 'demo@girojeri.com.br',
        role: 'CLIENTE',
        memberSince: 'Fevereiro de 2026'
    });

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <div className="animate-fade-up" style={{ padding: '24px', paddingBottom: '100px' }}>
            <h1 style={{ marginBottom: '24px', fontSize: '1.5rem', color: 'hsl(var(--primary))' }}>Meu Perfil</h1>

            <div className="card mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))', color: 'white', border: 'none' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>
                    <User size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem' }}>{user.name}</h2>
                    <p style={{ opacity: 0.8, fontSize: '0.85rem', color: 'white' }}>{user.email}</p>
                    <div style={{ display: 'inline-block', background: 'hsla(0,0%,0%,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', marginTop: '4px' }}>
                        {user.role}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
                <div className="card flex items-center justify-between" style={{ padding: '16px' }}>
                    <div className="flex items-center gap-3">
                        <Award size={20} color="hsl(var(--secondary))" />
                        <span style={{ fontWeight: 500 }}>Programa de Fidelidade</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>0 giros</span>
                </div>

                <div className="card flex items-center gap-3" style={{ padding: '16px' }}>
                    <Settings size={20} color="hsl(var(--text-muted))" />
                    <span style={{ fontWeight: 500 }}>Configurações da Conta</span>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="btn w-full flex items-center justify-center gap-2"
                style={{ background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))' }}
            >
                <LogOut size={18} /> Sair da conta
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '32px' }}>
                Giro Jeri v1.0.0
            </p>
        </div>
    );
}
