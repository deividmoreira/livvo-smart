"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, MessageCircle, MapPin } from 'lucide-react';

export default function AgencyDashboard() {
    const [liveOrders, setLiveOrders] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        // 1. Fetch live orders immediately 
        // 2. Connect to SSE for updates
        const eventSource = new EventSource('/api/agencies/orders/live');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status === 'AGUARDANDO_ACEITE') {
                setLiveOrders(prev => [data, ...prev]);
                // Toca um beep sonoro (se o browser permitir)
                try { new Audio('/beep.mp3').play(); } catch (e) { }
            }
        };

        // Mocks for presentation MVP
        setLiveOrders([
            { id: '101', serviceType: 'PRIVATIVO', pickupLocation: 'Pousada Jeri', scheduledAt: new Date(Date.now() + 86400000).toISOString(), baseTotal: 400, finalTotal: 440, acceptExpiresAt: new Date(Date.now() + 900000).toISOString() }
        ]);

        setHistory([
            { id: '100', status: 'CONFIRMADA', serviceType: 'TRANSLADO', pickupLocation: 'JJD Airport', finalTotal: 200 }
        ]);

        return () => eventSource.close();
    }, []);

    const handleAccept = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agencyId: 'agency_demo_1' })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setLiveOrders(prev => prev.filter(o => o.id !== orderId)); // Remove se alguém já pegou
            } else {
                // Move da lista ao vivo para o histórico localmente
                const wonOrder = liveOrders.find(o => o.id === orderId);
                setLiveOrders(prev => prev.filter(o => o.id !== orderId));
                if (wonOrder) setHistory(prev => [{ ...wonOrder, status: 'CONFIRMADA' }, ...prev]);
            }
        } catch (e) {
            setError("Erro ao se conectar.");
        }
    };

    return (
        <div style={{ padding: '24px', background: 'hsl(var(--background))', minHeight: '100vh' }}>
            <header className="flex justify-between items-center mb-6">
                <h1 style={{ color: 'hsl(var(--text-main))', fontSize: '1.5rem' }}>Painel da Agência</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'hsl(var(--success))' }}></div>
                    Online
                </div>
            </header>

            {error && (
                <div style={{ padding: '12px', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: 'hsl(var(--danger))', animation: 'pulse 2s infinite' }}></span>
                Disputas ao Vivo
            </h2>

            <div className="flex flex-col gap-4 mb-8">
                {liveOrders.length === 0 ? (
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Nenhuma corrida pendente no momento...</p>
                ) : (
                    liveOrders.map(order => (
                        <div key={order.id} className="card animate-fade-up" style={{ borderLeft: '4px solid hsl(var(--danger))' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span style={{ fontWeight: 600, color: 'hsl(var(--danger))' }}>NOVA CORRIDA</span>
                                <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
                                    Restam {Math.max(0, Math.floor((new Date(order.acceptExpiresAt).getTime() - Date.now()) / 60000))} min
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{order.serviceType}</h3>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
                                <MapPin size={14} /> Saída: {order.pickupLocation}
                            </p>
                            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                                Data: {new Date(order.scheduledAt).toLocaleDateString('pt-BR')}
                            </p>
                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'hsl(var(--primary-dark))' }}>
                                    R$ {order.finalTotal?.toFixed(2)}
                                </span>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAccept(order.id)}
                                    style={{ background: 'hsl(var(--success))', boxShadow: '0 4px 12px hsla(var(--success), 0.3)' }}
                                >
                                    <Check size={18} /> Aceitar Rapido
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Corridas Aceitas</h2>
            <div className="flex flex-col gap-4">
                {history.map(order => (
                    <div key={order.id} className="card" style={{ background: 'hsl(var(--surface-alt))' }}>
                        <div className="flex justify-between items-center mb-2">
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.serviceType}</span>
                            <span style={{ color: 'hsl(var(--success))', fontSize: '0.8rem', fontWeight: 600 }}>{order.status}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />{order.pickupLocation}
                        </p>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button className="btn" style={{ flex: 1, background: '#25D366', color: 'white', padding: '10px' }}>
                                <MessageCircle size={16} /> WhatsApp
                            </button>
                            <button className="btn" style={{ flex: 1, background: 'hsl(var(--surface))', color: 'hsl(var(--text-main))', border: '1px solid hsl(var(--text-muted))', padding: '10px' }}>
                                Finalizar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 hsla(var(--danger), 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px hsla(var(--danger), 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 hsla(var(--danger), 0); } }
      `}} />
        </div>
    );
}
