import { useState } from 'react';
import type { RadioStation } from '../types';

interface SidebarProps {
  isOpen: boolean;
  stations: RadioStation[];
  onSelectStation: (s: RadioStation) => void;
  width: number;
  favorites: string[];
  toggleFavorite: (url: string) => void;
}

export default function Sidebar({ isOpen, stations, onSelectStation, width, favorites, toggleFavorite }: SidebarProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const groupedStations = stations.reduce((acc: any, station) => {
    if (!acc[station.country]) acc[station.country] = [];
    acc[station.country].push(station);
    return acc;
  }, {});

  // Cria um grupo especial de favoritos no topo
  const favStations = stations.filter(s => favorites.includes(s.streamUrl));
  if (favStations.length > 0) {
    groupedStations['⭐ Favoritos'] = favStations;
  }

  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country);
  };

  // Garante que "⭐ Favoritos" seja sempre o primeiro da lista
  const sortedCountries = Object.keys(groupedStations).sort((a, b) => {
    if (a === '⭐ Favoritos') return -1;
    if (b === '⭐ Favoritos') return 1;
    return a.localeCompare(b);
  });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, height: '100vh',
      width: isOpen ? width : 0,
      background: 'rgba(2, 6, 23, 0.35)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRight: isOpen ? '1px solid rgba(6, 182, 212, 0.3)' : 'none',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      overflowX: 'hidden', overflowY: 'auto',
      zIndex: 40, boxSizing: 'border-box', boxShadow: isOpen ? '20px 0 40px rgba(0,0,0,0.5)' : 'none'
    }}>
      <div style={{ width: width, padding: '24px 20px', boxSizing: 'border-box', opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}>
        <h2 style={{ borderBottom: '1px solid rgba(6, 182, 212, 0.4)', paddingBottom: '12px', marginTop: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '2px', color: '#06b6d4', fontFamily: 'sans-serif' }}>
          DIRETÓRIO GLOBAL
        </h2>
        
        {sortedCountries.map(country => (
          <div key={country} style={{ marginBottom: '8px' }}>
            <button 
              onClick={() => toggleCountry(country)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: expandedCountry === country ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: expandedCountry === country ? '#00f6ff' : '#f8fafc',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                padding: '12px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                letterSpacing: '1px', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box'
              }}
            >
              <span style={{ color: country === '⭐ Favoritos' ? '#fbbf24' : 'inherit' }}>
                {country.toUpperCase()}
              </span>
              <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.3)' }}>
                {expandedCountry === country ? '▼' : '▶'} {groupedStations[country].length}
              </span>
            </button>
            
            {expandedCountry === country && (
              <ul style={{ 
                listStyle: 'none', padding: '10px 0 10px 16px', margin: '4px 0 12px 6px', 
                borderLeft: '2px solid rgba(6, 182, 212, 0.4)', maxHeight: '300px', overflowY: 'auto' 
              }}>
                {groupedStations[country].sort((a: any, b: any) => a.city.localeCompare(b.city)).map((radio: RadioStation, idx: number) => {
                  const isFav = favorites.includes(radio.streamUrl);
                  return (
                    <li 
                      key={`${radio.streamUrl}-${idx}`} 
                      onClick={() => onSelectStation(radio)}
                      style={{ 
                        padding: '10px 12px', cursor: 'pointer', borderRadius: '6px',
                        display: 'flex', flexDirection: 'column', transition: 'all 0.2s', marginBottom: '4px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid transparent'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px' }}>{radio.city}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Impede que clicar na estrela ative a rádio
                            toggleFavorite(radio.streamUrl);
                          }}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none',
                            color: isFav ? '#fbbf24' : 'rgba(255,255,255,0.3)', fontSize: '16px', padding: '0 4px'
                          }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>
                      <span style={{ color: '#06b6d4', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace' }}>{radio.name}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}