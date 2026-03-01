"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [status, setStatus] = useState<'pending' | 'processing' | 'success'>('pending');

    const handlePay = async () => {
        setStatus('processing');

        try {
            // Mocking the webhook call that Mercado Pago would do
            const res = await fetch('/api/payments/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: id,
                    status: 'approved',
                    paymentId: 'mock_' + Math.floor(Math.random() * 1000000)
                })
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => {
                    router.push('/corridas');
                }, 2000);
            } else {
                alert("Erro ao processar pagamento falso.");
                setStatus('pending');
            }
        } catch (error) {
            console.error(error);
            setStatus('pending');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-up">
                <CheckCircle size={64} color="hsl(var(--success))" className="mb-4" />
                <h1 style={{ color: 'hsl(var(--success))', textAlign: 'center' }}>Pagamento Aprovado!</h1>
                <p style={{ textAlign: 'center', marginTop: '8px' }}>Sua corrida entrou em disputa com nossas agências.</p>
                <p style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Redirecionando para suas corridas...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-up">
            <div className="mb-8 flex flex-col items-center">
                <div style={{ background: 'hsla(var(--primary), 0.1)', padding: '16px', borderRadius: '50%', color: 'hsl(var(--primary))', marginBottom: '16px' }}>
                    <CreditCard size={48} strokeWidth={1.5} />
                </div>
                <h1 style={{ color: 'hsl(var(--text-main))', textAlign: 'center' }}>Checkout Mercado Pago</h1>
                <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem' }}>Ambiente de simulação de pagamento.</p>
            </div>

            <div className="card w-full max-w-sm mb-4 text-center">
                <p className="mb-4">Pedido ID: {id}</p>
                <button
                    onClick={handlePay}
                    disabled={status === 'processing'}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                    {status === 'processing' ? (
                        <><Loader2 className="animate-spin" size={20} /> Processando...</>
                    ) : (
                        'Simular Pagamento Aprovado'
                    )}
                </button>
            </div>
        </div>
    );
}
