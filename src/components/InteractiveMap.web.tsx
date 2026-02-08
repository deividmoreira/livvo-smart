import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Imovel, MapRegion } from '../types';
import { COLORS, DEFAULT_MAP_REGION } from '../constants';
import { formatarMoedaAbreviada, formatarMoeda, formatarEnderecoResumido } from '../utils/formatters';

interface InteractiveMapWebProps {
  imoveis: Imovel[];
  region?: MapRegion;
  onMarkerPress: (imovel: Imovel) => void;
  onViewDetails?: (imovel: Imovel) => void;
  selectedImovelId?: string;
  useSatellite?: boolean;
}

export const InteractiveMapWeb: React.FC<InteractiveMapWebProps> = ({
  imoveis,
  region = DEFAULT_MAP_REGION,
  onMarkerPress,
  onViewDetails,
  selectedImovelId,
  useSatellite = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const imoveisRef = useRef<Imovel[]>(imoveis);
  imoveisRef.current = imoveis;
  const onViewDetailsRef = useRef(onViewDetails);
  onViewDetailsRef.current = onViewDetails;

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapContainerRef.current) return;

    const loadMap = async () => {
      const L = await import('leaflet');

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // CSS customizado para marcadores de preço estilo Mappo
      if (!document.getElementById('mappo-marker-css')) {
        const style = document.createElement('style');
        style.id = 'mappo-marker-css';
        style.textContent = `
          .price-marker {
            background: #FB4748;
            border: 2px solid #FB4748;
            border-radius: 20px;
            padding: 5px 12px;
            font-size: 12px;
            font-weight: 700;
            font-family: 'Manrope', -apple-system, sans-serif;
            color: #FFFFFF;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(251, 71, 72, 0.35);
            cursor: pointer;
            transition: all 0.15s ease;
            position: relative;
          }
          .price-marker:hover {
            background: #E03E3F;
            border-color: #E03E3F;
            transform: scale(1.08);
            z-index: 1000 !important;
            box-shadow: 0 4px 12px rgba(251, 71, 72, 0.5);
          }
          .price-marker.selected {
            background: #0F172A;
            color: white;
            border-color: #0F172A;
            transform: scale(1.1);
            z-index: 1000 !important;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.4);
          }
          .price-marker::after {
            content: '';
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 7px solid #FB4748;
            transition: border-top-color 0.15s ease;
          }
          .price-marker:hover::after {
            border-top-color: #E03E3F;
          }
          .price-marker.selected::after {
            border-top-color: #0F172A;
          }
          .leaflet-div-icon {
            background: transparent !important;
            border: none !important;
          }
          /* Popup estilo Mappo */
          .leaflet-popup-content-wrapper {
            border-radius: 10px !important;
            padding: 0 !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
            overflow: hidden;
          }
          .leaflet-popup-content {
            margin: 0 !important;
            width: 280px !important;
          }
          .leaflet-popup-tip {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
          }
          .mappo-popup {
            font-family: 'Manrope', -apple-system, sans-serif;
          }
          .mappo-popup-img {
            width: 100%;
            height: 140px;
            object-fit: cover;
            display: block;
          }
          .mappo-popup-body {
            padding: 12px;
          }
          .mappo-popup-price {
            font-size: 18px;
            font-weight: 700;
            color: #1C1917;
            margin-bottom: 2px;
          }
          .mappo-popup-title {
            font-size: 13px;
            color: #57534E;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mappo-popup-location {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #57534E;
            margin-bottom: 8px;
          }
          .mappo-popup-location svg {
            flex-shrink: 0;
          }
          .mappo-popup-features {
            display: flex;
            gap: 12px;
            padding-top: 8px;
            border-top: 1px solid #E7E5E4;
            margin-bottom: 10px;
          }
          .mappo-popup-feat {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #57534E;
          }
          .mappo-popup-feat svg {
            flex-shrink: 0;
          }
          .mappo-popup-btn {
            display: block;
            width: 100%;
            padding: 8px;
            background: #FB4748;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            font-family: 'Manrope', -apple-system, sans-serif;
            cursor: pointer;
            text-align: center;
            transition: background 0.15s ease;
          }
          .mappo-popup-btn:hover {
            background: #E03E3F;
          }
        `;
        document.head.appendChild(style);
      }

      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
        }).setView([region.latitude, region.longitude], 14);

        // Usar CartoDB Voyager (clean, moderno) como estilo padrão
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 20,
          subdomains: 'abcd',
        }).addTo(mapRef.current);
      }

      // Limpar marcadores antigos
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Listener global para botão "Ver Detalhes" dentro dos popups
      if (!(window as any).__mappoPopupListenerAdded) {
        document.addEventListener('click', (e) => {
          const btn = (e.target as HTMLElement).closest('.mappo-popup-btn') as HTMLElement;
          if (btn) {
            const imovelId = btn.dataset.imovelId;
            if (imovelId) {
              const found = imoveisRef.current.find(i => i.id === imovelId);
              if (found && onViewDetailsRef.current) {
                onViewDetailsRef.current(found);
              }
            }
          }
        });
        (window as any).__mappoPopupListenerAdded = true;
      }

      // Adicionar marcadores de preço
      imoveis.forEach((imovel) => {
        const isSelected = imovel.id === selectedImovelId;
        const priceText = formatarMoedaAbreviada(imovel.valor);

        const icon = L.divIcon({
          className: 'price-marker-wrapper',
          html: `<div class="price-marker ${isSelected ? 'selected' : ''}">${priceText}</div>`,
          iconSize: [0, 0],
          iconAnchor: [40, 36],
        });

        const marker = L.marker(
          [imovel.localizacao.latitude, imovel.localizacao.longitude],
          { icon }
        ).addTo(mapRef.current);

        // Popup com informações do imóvel
        const imagemUrl = imovel.midias.find(m => m.principal && m.tipo === 'imagem')?.url
          || imovel.midias.find(m => m.tipo === 'imagem')?.url
          || '';
        const endereco = formatarEnderecoResumido(imovel.localizacao);
        const preco = formatarMoeda(imovel.valor);

        const featuresHtml = [
          imovel.caracteristicas.quartos ? `<span class="mappo-popup-feat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#57534E" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>${imovel.caracteristicas.quartos} qts</span>` : '',
          imovel.caracteristicas.banheiros ? `<span class="mappo-popup-feat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#57534E" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/></svg>${imovel.caracteristicas.banheiros} ban</span>` : '',
          imovel.caracteristicas.vagas_garagem ? `<span class="mappo-popup-feat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#57534E" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10H6l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>${imovel.caracteristicas.vagas_garagem} vg</span>` : '',
          imovel.caracteristicas.area_total ? `<span class="mappo-popup-feat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#57534E" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>${imovel.caracteristicas.area_total}m²</span>` : '',
        ].filter(Boolean).join('');

        const popupHtml = `
          <div class="mappo-popup">
            ${imagemUrl ? `<img class="mappo-popup-img" src="${imagemUrl}" alt="${imovel.titulo}" />` : ''}
            <div class="mappo-popup-body">
              <div class="mappo-popup-price">${preco}</div>
              <div class="mappo-popup-title">${imovel.titulo}</div>
              <div class="mappo-popup-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#57534E" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${endereco}
              </div>
              ${featuresHtml ? `<div class="mappo-popup-features">${featuresHtml}</div>` : ''}
              <button class="mappo-popup-btn" data-imovel-id="${imovel.id}">Ver Detalhes</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          maxWidth: 280,
          minWidth: 280,
          className: 'mappo-popup-container',
          closeButton: true,
        });

        marker.on('click', () => {
          onMarkerPress(imovel);
        });

        markersRef.current.push(marker);
      });
    };

    loadMap();
  }, [imoveis, selectedImovelId, useSatellite]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([region.latitude, region.longitude], 14);
    }
  }, [region.latitude, region.longitude]);

  // Centralizar no imóvel selecionado
  useEffect(() => {
    if (selectedImovelId && mapRef.current) {
      const imovel = imoveis.find(i => i.id === selectedImovelId);
      if (imovel) {
        mapRef.current.panTo([imovel.localizacao.latitude, imovel.localizacao.longitude]);
      }
    }
  }, [selectedImovelId]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
});
