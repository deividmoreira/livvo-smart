"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users, Car, ChevronLeft, CreditCard } from 'lucide-react';

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [service, setService] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);

    // Booking Form State
    const [date, setDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [selectedVehicles, setSelectedVehicles] = useState<{ id: string, qty: number }[]>([]);

    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quoting, setQuoting] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        // Mock fetch service & vehicles
        fetch('/api/services').then(res => res.json()).then(data => {
            const s = data.find((x: any) => x.id === id);
            if (s) setService(s);
            else setService({ id, name: 'Passeio Selecionado', type: 'PRIVATIVO', basePrice: 0 }); // Fallback

            fetch('/api/vehicles').then(res => res.json()).then(vData => {
                if (vData.length > 0) setVehicles(vData);
                else setVehicles([
                    { id: 'v1', name: 'Buggy (Até 4 pessoas)', price: 400 },
                    { id: 'v2', name: 'Hilux SW4 (Até 6 pessoas)', price: 800 }
                ]);
                setLoading(false);
            });
        });
    }, [id]);

    const handleVehicleToggle = (vId: string) => {
        const exists = selectedVehicles.find(v => v.id === vId);
        if (exists) {
            setSelectedVehicles(selectedVehicles.filter(v => v.id !== vId));
        } else {
            setSelectedVehicles([...selectedVehicles, { id: vId, qty: 1 }]);
        }
    };

    const handleQuote = async () => {
        if (!date) return alert("Selecione uma data");
        if (service?.type === 'PRIVATIVO' && selectedVehicles.length === 0) return alert("Selecione ao menos um veículo");

        setQuoting(true);
        try {
            const res = await fetch('/api/pricing/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: id,
                    scheduledAt: date,
                    peopleCount: adults + children,
                    vehicles: selectedVehicles.map(v => ({ vehicleId: v.id, quantity: v.qty }))
                })
            });
            const data = await res.json();

            // If quote fails, use mock for demo
            if (data.error) {
                let base = service.basePrice || 0;
                if (service.type === 'PRIVATIVO') {
                    base = selectedVehicles.reduce((acc, curr) => {
                        const v = vehicles.find(x => x.id === curr.id);
                        return acc + ((v?.price || 0) * curr.qty);
                    }, 0);
                } else {
                    base = base * (adults + children);
                }
                setQuote({ finalTotal: base, baseTotal: base, pricingMultiplier: 1.0 });
            } else {
                setQuote(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setQuoting(false);
        }
    };

    const handleBook = async () => {
        setBooking(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: id,
                    scheduledAt: date,
                    adults,
                    children,
                    pickupLocation: "Pousada Central", // Form omitted for brevity
                    vehicles: selectedVehicles.map(v => ({ vehicleId: v.id, quantity: v.qty }))
                })
            });

            // Mocking payment redirect
            setTimeout(() => {
                router.push('/pagamento/' + (await res.json().catch(() => ({ id: 'mock123' }))).id);
            }, 1000);
        } catch (error) {
            // Se der erro (ex: não logado), manda pro login e depois volta pra reserva é o fluxo normal
            alert("Faça login para continuar.");
            router.push('/login');
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <div className="p-4 mt-8 flex justify-center"><p>Carregando...</p></div>;

    return (
        <div className="animate-fade-up" style={{ padding: '24px', paddingBottom: '100px' }}>
            <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-primary" style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontWeight: 600 }}>
                <ChevronLeft size={20} /> Voltar
            </button>

            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'hsl(var(--text-main))' }}>{service?.name}</h1>
            <p style={{ display: 'inline-block', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '24px' }}>
                {service?.type}
            </p>

            <div className="card mb-6">
                <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="hsl(var(--primary))" /> Data do Passeio
                </h2>
                <input
                    type="date"
                    className="input-field w-full"
                    style={{ width: '100%' }}
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setQuote(null); }}
                />
            </div>

            <div className="card mb-6 flex flex-col gap-4">
                <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="hsl(var(--primary))" /> Passageiros
                </h2>
                <div className="flex justify-between items-center">
                    <span>Adultos</span>
                    <div className="flex items-center gap-4">
                        <button className="btn" style={{ padding: '8px 12px', background: 'hsl(var(--surface-alt))' }} onClick={() => { if (adults > 1) { setAdults(adults - 1); setQuote(null); } }}>-</button>
                        <span style={{ width: '20px', textAlign: 'center', fontWeight: 600 }}>{adults}</span>
                        <button className="btn" style={{ padding: '8px 12px', background: 'hsl(var(--surface-alt))' }} onClick={() => { setAdults(adults + 1); setQuote(null); }}>+</button>
                    </div>
                </div>
            </div>

            {service?.type === 'PRIVATIVO' && (
                <div className="card mb-6 flex flex-col gap-4">
                    <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Car size={18} color="hsl(var(--primary))" /> Veículos
                    </h2>
                    {vehicles.map(v => {
                        const isSelected = selectedVehicles.some(sv => sv.id === v.id);
                        return (
                            <div
                                key={v.id}
                                onClick={() => { handleVehicleToggle(v.id); setQuote(null); }}
                                className={`flex justify-between items-center p-3 rounded-md transition-all ${isSelected ? 'border-primary' : ''}`}
                                style={{
                                    border: `2px solid ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--surface-alt))'}`,
                                    background: isSelected ? 'hsla(var(--primary), 0.05)' : 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, color: 'hsl(var(--text-main))' }}>{v.name}</div>
                                    <div style={{ fontSize: '0.85rem' }}>R$ {v.price.toFixed(2)}</div>
                                </div>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    border: `2px solid ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--surface-alt))'}`,
                                    background: isSelected ? 'hsl(var(--primary))' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white' }} />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {!quote ? (
                <button
                    onClick={handleQuote}
                    disabled={quoting}
                    className="btn btn-secondary w-full flex justify-center mt-4"
                    style={{ width: '100%', padding: '16px' }}
                >
                    {quoting ? 'Calculando...' : 'Calcular Preço'}
                </button>
            ) : (
                <div className="card mt-4" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))', color: 'white', border: 'none' }}>
                    <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total da Reserva</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0' }}>
                        R$ {quote.finalTotal.toFixed(2)}
                    </div>
                    {quote.pricingMultiplier > 1 && (
                        <div style={{ fontSize: '0.8rem', background: 'hsla(0,0%,0%,0.2)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '16px' }}>
                            Taxa de alta temporada/feriado aplicada (+{Math.round((quote.pricingMultiplier - 1) * 100)}%)
                        </div>
                    )}
                    <button
                        onClick={handleBook}
                        disabled={booking}
                        className="btn w-full flex items-center justify-center gap-2 mt-2"
                        style={{ background: 'white', color: 'hsl(var(--primary-dark))', width: '100%' }}
                    >
                        <CreditCard size={18} /> {booking ? 'Processando...' : 'Ir para Pagamento'}
                    </button>
                </div>
            )}
        </div>
    );
}
