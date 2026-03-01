"use client";

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Navigation, MessageCircle } from 'lucide-react';

export default function RidesPage() {
    // For demo purposes, we allow toggling the role to see both views easily
    const [role, setRole] = useState<'CLIENTE' | 'AGENCIA'>('CLIENTE');

    // Mocks
    const [activeDisputes, setActiveDisputes] = useState<any[]>([]);
    const [myRides, setMyRides] = useState<any[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    useEffect(() => {
        // Mock data initialization
        if (role === 'AGENCIA') {
            setActiveDisputes([
                { id: '1', serviceName: 'Litoral Oeste', date: 'Hoje, 09:00', price: 120, pax: 2, status: 'AGUARDANDO_ACEITE', pickup: 'Pousada Jeri' },
                { id: '2', serviceName: 'Transfer JJD', date: 'Amanhã, 14:00', price: 200, pax: 4, status: 'AGUARDANDO_ACEITE', pickup: 'Aeroporto JJD' }
            ]);
            setMyRides([
                { id: '3', serviceName: 'Litoral Leste', date: 'Ontem', price: 400, status: 'FINALIZADA', clientPhone: '5511999999999' }
            ]);
        } else {
            setMyRides([
                { id: '1', serviceName: 'Passeio Litoral Leste', date: '01/03/2026, 08:00', price: 450, status: 'AGUARDANDO_ACEITE' },
                { id: '4', serviceName: 'Transfer JJD -> Jeri', date: '28/02/2026, 14:30', price: 200, status: 'CONFIRMADA', agencyName: 'Jeri Tour' }
            ]);
        }
    }, [role]);

    const handleAcceptDispute = (id: string) => {
        setLoadingAction(id);
        setTimeout(() => {
            const dispute = activeDisputes.find(d => d.id === id);
            if (dispute) {
                setActiveDisputes(activeDisputes.filter(d => d.id !== id));
                setMyRides([{ ...dispute, status: 'CONFIRMADA', clientPhone: '5511999999999' }, ...myRides]);
            }
            setLoadingAction(null);
        }, 800);
    };

    return (
        <div className="animate-fade-up" style={{ padding: '24px', paddingBottom: '100px' }}>

            <header className="flex justify-between items-center mb-6">
                <h1 style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))' }}>Corridas</h1>

                {/* Demo Role Switcher */}
                <select
                    className="input-field"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                >
                    <option value="CLIENTE">Ver como Cliente</option>
                    <option value="AGENCIA">Ver como Agência</option>
                </select>
            </header>

            {role === 'AGENCIA' && (
                <div className="mb-8">
                    <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem' }}>
                        <Navigation size={20} color="hsl(var(--warning))" /> Disputas Ativas
                    </h2>

                    {activeDisputes.length === 0 ? (
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>Nenhuma disputa no momento.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {activeDisputes.map(dispute => (
                                <div key={dispute.id} className="card" style={{ borderLeft: '4px solid hsl(var(--warning))' }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 style={{ fontSize: '1.1rem' }}>{dispute.serviceName}</h3>
                                        <span style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>R$ {dispute.price}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}><strong>Data:</strong> {dispute.date}</p>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}><strong>Passageiros:</strong> {dispute.pax}</p>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}><strong>Origem:</strong> {dispute.pickup}</p>

                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => handleAcceptDispute(dispute.id)}
                                        disabled={loadingAction === dispute.id}
                                    >
                                        {loadingAction === dispute.id ? 'Aceitando...' : 'Aceitar Corrida'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div>
                <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem' }}>
                    <Clock size={20} color="hsl(var(--primary))" />
                    {role === 'CLIENTE' ? 'Minhas Reservas' : 'Minhas Corridas Confirmadas'}
                </h2>

                {myRides.length === 0 ? (
                    <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>Nenhuma corrida encontrada.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {myRides.map(ride => (
                            <div key={ride.id} className="card">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 style={{ fontSize: '1.1rem' }}>{ride.serviceName}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '4px 8px',
                                        borderRadius: 'var(--radius-pill)',
                                        background: ride.status === 'CONFIRMADA' ? 'hsla(var(--success), 0.1)' : 'hsla(var(--primary), 0.1)',
                                        color: ride.status === 'CONFIRMADA' ? 'hsl(var(--success))' : 'hsl(var(--primary))'
                                    }}>
                                        {ride.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Data: {ride.date}</p>
                                <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'hsl(var(--text-muted))' }}>
                                    {role === 'CLIENTE' ? `Agência: ${ride.agencyName || 'Aguardando aceite...'}` : `Valor Líquido: R$ ${(ride.price * 0.85).toFixed(2)}`}
                                </p>

                                {role === 'AGENCIA' && ride.status === 'CONFIRMADA' && (
                                    <div className="flex gap-2">
                                        <a
                                            href={`https://wa.me/${ride.clientPhone}?text=Olá! Somos da agência Jeri Tour e confirmamos seu passeio ${ride.serviceName}.`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn flex-1 flex justify-center"
                                            style={{ background: '#25D366', color: 'white', padding: '10px' }}
                                        >
                                            <MessageCircle size={18} /> WhatsApp
                                        </a>
                                        <button className="btn" style={{ background: 'hsl(var(--surface-alt))', color: 'hsl(var(--text-main))', padding: '10px' }}>
                                            <CheckCircle size={18} /> Finalizar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
