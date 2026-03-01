"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Users, Car, ChevronRight, Sunrise } from 'lucide-react';

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca serviços da API (Mockado por enquanto se sem dados)
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        // Se banco estiver vazio, usa mock para mostrar UI rica
        if (!data || data.length === 0) {
          setServices([
            { id: '1', name: 'Litoral Leste', type: 'PRIVATIVO', description: 'Lagoa Azul, Árvore da Preguiça, Buraco Azul' },
            { id: '2', name: 'Litoral Oeste', type: 'COMPARTILHADO', basePrice: 120, description: 'Mangue Seco, Tatajuba, Lagoa Grande' },
            { id: '3', name: 'Transfer Aeroporto (JJD) -> Jeri', type: 'TRANSLADO', basePrice: 200, description: 'Hilux ou SW4, máximo 4 pessoas' }
          ]);
        } else {
          setServices(data);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-up" style={{ padding: '24px' }}>

      {/* Home Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 style={{ color: 'hsl(var(--primary))' }}>Giro Jeri</h1>
          <p>O melhor de Jericoacoara para você.</p>
        </div>
        <div style={{ background: 'hsla(var(--primary), 0.1)', padding: '10px', borderRadius: 'var(--radius-pill)', color: 'hsl(var(--primary))' }}>
          <Sunrise size={28} />
        </div>
      </header>

      {/* Floating Call to Action */}
      <div className="card mb-4" style={{ background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))', color: 'white', border: 'none' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Planeje sua Aventura</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '16px' }}>Reserve passeios e translados com facilidade.</p>
        <button className="btn" style={{ background: 'white', color: 'hsl(var(--text-main))', fontSize: '0.9rem', padding: '10px 16px' }}>
          Ver Promoções
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Nossos Serviços</h2>

      <div className="flex flex-col gap-4">
        {loading ? (
          <p>Carregando catálogo...</p>
        ) : (
          services.map(service => (
            <Link href={`/reserva/${service.id}`} key={service.id} style={{ textDecoration: 'none' }}>
              <div className="card flex items-center justify-between" style={{ cursor: 'pointer' }}>
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="flex items-center gap-2">
                    {service.type === 'PRIVATIVO' && <Car size={18} color="hsl(var(--primary))" />}
                    {service.type === 'COMPARTILHADO' && <Users size={18} color="hsl(var(--secondary))" />}
                    {service.type === 'TRANSLADO' && <MapPin size={18} color="hsl(var(--success))" />}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))', letterSpacing: '0.5px' }}>
                      {service.type}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: 'hsl(var(--text-main))' }}>{service.name}</h3>
                  <p style={{ fontSize: '0.85rem' }}>{service.description}</p>

                  {service.basePrice && (
                    <div className="mt-1" style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>
                      A partir de R$ {service.basePrice.toFixed(2)}{service.type === 'COMPARTILHADO' ? '/pessoa' : ''}
                    </div>
                  )}
                </div>
                <div style={{ color: 'hsl(var(--surface-alt))', background: 'hsl(var(--text-main))', borderRadius: '50%', padding: '6px' }}>
                  <ChevronRight size={20} color="white" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
