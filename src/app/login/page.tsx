"use client";

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Credenciais inválidas. Tente novamente.");
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-up">
            <div className="mb-8 flex flex-col items-center">
                <div style={{ background: 'hsla(var(--primary), 0.1)', padding: '16px', borderRadius: '50%', color: 'hsl(var(--primary))', marginBottom: '16px' }}>
                    <Shield size={48} strokeWidth={1.5} />
                </div>
                <h1 style={{ color: 'hsl(var(--primary))', textAlign: 'center' }}>Bem-vindo ao Giro Jeri</h1>
                <p style={{ textAlign: 'center', marginTop: '8px' }}>Acesse sua conta para continuar.</p>
            </div>

            <form onSubmit={handleSubmit} className="card w-full max-w-sm mb-4">
                {error && (
                    <div style={{ background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <div className="input-group">
                    <label className="input-label" htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        className="input-field"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {loading ? 'Entrando...' : (
                        <>Entrar <ArrowRight size={20} /></>
                    )}
                </button>
            </form>

            <p style={{ fontSize: '0.85rem' }}>
                Ainda não tem conta? <a href="/registro" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>Cadastre-se</a>
            </p>
        </div>
    );
}
