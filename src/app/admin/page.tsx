"use client";

import { useEffect, useState } from 'react';
import { Calendar, Percent, Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
    const [agencies, setAgencies] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [agRes, holRes, rulRes] = await Promise.all([
                fetch('/api/admin/agencies'),
                fetch('/api/admin/holidays'),
                fetch('/api/admin/pricing-rules')
            ]);

            // Allow failing gracefully on mock API/empty DB
            setAgencies(agRes.ok ? await agRes.json() : []);
            setHolidays(holRes.ok ? await holRes.json() : []);
            setRules(rulRes.ok ? await rulRes.json() : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Fallback for demo if APIs are empty/fail
        setTimeout(() => {
            if (agencies.length === 0) {
                setAgencies([
                    { id: '1', name: 'Jeri Tour', cnpj: '12.345.678/0001-90', status: 'ATIVA' },
                    { id: '2', name: 'Sol e Mar Turismo', cnpj: '98.765.432/0001-10', status: 'SUSPENSA' }
                ]);
            }
            if (holidays.length === 0) {
                setHolidays([
                    { id: '1', name: 'Natal', date: '2026-12-25T00:00:00Z' }
                ]);
            }
            if (rules.length === 0) {
                setRules([
                    { id: '1', name: 'FERIADO', value: 10 }
                ]);
            }
        }, 800);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleAgencyStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ATIVA' ? 'SUSPENSA' : 'ATIVA';
        // mock UI update
        setAgencies(agencies.map(a => a.id === id ? { ...a, status: newStatus } : a));
        try {
            await fetch(`/api/admin/agencies/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) { }
    };

    if (loading) return <div className="p-4 flex justify-center mt-12"><p>Carregando painel...</p></div>;

    return (
        <div className="animate-fade-up" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

            <header className="mb-8">
                <h1 style={{ fontSize: '1.8rem', color: 'hsl(var(--primary))' }}>Painel Administrativo</h1>
                <p style={{ color: 'hsl(var(--text-muted))' }}>Gerencie as agências, feriados e regras de negócio da plataforma Giro Jeri.</p>
            </header>

            <section className="mb-8 card">
                <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.3rem', color: 'hsl(var(--text-main))' }}>
                    <Users size={24} color="hsl(var(--primary))" /> Agências Parceiras
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid hsl(var(--surface-alt))' }}>
                                <th style={{ padding: '12px 8px' }}>Nome / CNPJ</th>
                                <th style={{ padding: '12px 8px' }}>Status</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agencies.map(agency => (
                                <tr key={agency.id} style={{ borderBottom: '1px solid hsl(var(--surface-alt))' }}>
                                    <td style={{ padding: '12px 8px' }}>
                                        <div style={{ fontWeight: 600 }}>{agency.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{agency.cnpj}</div>
                                    </td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span style={{
                                            background: agency.status === 'ATIVA' ? 'hsla(var(--success), 0.1)' : 'hsla(var(--danger), 0.1)',
                                            color: agency.status === 'ATIVA' ? 'hsl(var(--success))' : 'hsl(var(--danger))',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                                        }}>
                                            {agency.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => toggleAgencyStatus(agency.id, agency.status)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: agency.status === 'ATIVA' ? 'hsl(var(--danger))' : 'hsl(var(--success))'
                                            }}
                                            title={agency.status === 'ATIVA' ? "Suspender Agência" : "Ativar Agência"}
                                        >
                                            {agency.status === 'ATIVA' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="flex flex-col md:flex-row gap-6">
                <section className="card flex-1">
                    <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem', color: 'hsl(var(--text-main))' }}>
                        <Calendar size={20} color="hsl(var(--secondary))" /> Feriados Cadastrados
                    </h2>
                    {holidays.length === 0 && <p style={{ fontSize: '0.85rem' }}>Nenhum feriado cadastrado.</p>}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                        {holidays.map(holiday => (
                            <li key={holiday.id} className="flex justify-between items-center mb-2" style={{ borderBottom: '1px solid hsl(var(--surface-alt))', paddingBottom: '8px' }}>
                                <span>{holiday.name}</span>
                                <span style={{ color: 'hsl(var(--text-muted))' }}>{new Date(holiday.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            </li>
                        ))}
                    </ul>
                    <button className="btn mt-4" style={{ padding: '8px 12px', fontSize: '0.85rem', background: 'hsl(var(--surface-alt))', width: '100%' }}>
                        + Adicionar Feriado
                    </button>
                </section>

                <section className="card flex-1">
                    <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem', color: 'hsl(var(--text-main))' }}>
                        <Percent size={20} color="hsl(var(--success))" /> Regras de Preço
                    </h2>
                    {rules.map(rule => (
                        <div key={rule.id} className="flex justify-between items-center mb-3">
                            <div>
                                <div style={{ fontWeight: 600 }}>Acréscimo de {rule.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Aplicado fora da alta temporada</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'hsl(var(--primary))' }}>+{rule.value}%</div>
                        </div>
                    ))}
                    <button className="btn mt-4" style={{ padding: '8px 12px', fontSize: '0.85rem', background: 'hsl(var(--surface-alt))', width: '100%' }}>
                        Editar Regras
                    </button>
                </section>
            </div>

        </div>
    );
}
