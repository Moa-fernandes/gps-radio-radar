import { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { fetchGlobalStations } from './data/radios';
import type { RadioStation } from './types';

// Lista limpa e espaçada com os principais países do mundo
const WORLD_COUNTRIES = [
  { name: 'Brazil', lat: -14.2350, lng: -51.9253 },
  { name: 'United States', lat: 37.0902, lng: -95.7129 },
  { name: 'Canada', lat: 56.1304, lng: -106.3468 },
  { name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  { name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
  { name: 'France', lat: 46.6034, lng: 1.8883 },
  { name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { name: 'Spain', lat: 40.4637, lng: -3.7492 },
  { name: 'Italy', lat: 41.8719, lng: 12.5674 },
  { name: 'Russia', lat: 61.5240, lng: 105.3188 },
  { name: 'China', lat: 35.8617, lng: 104.1954 },
  { name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { name: 'Australia', lat: -25.2744, lng: 133.7751 },
  { name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  { name: 'India', lat: 20.5937, lng: 78.9629 },
  { name: 'Mexico', lat: 23.6345, lng: -102.5528 }
];

export default function App() {
  const globeEl = useRef<any>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controle Dinâmico de Tamanho de Tela para Responsividade
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 768;
  const SIDEBAR_WIDTH = isMobile ? windowSize.width : 340; // Ocupa a tela toda no celular

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gps_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchGlobalStations().then((data) => {
      setStations(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (streamUrl: string) => {
    setFavorites(prev => prev.includes(streamUrl) ? prev.filter(url => url !== streamUrl) : [...prev, streamUrl]);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!globeEl.current) return;
    const currentPov = globeEl.current.pointOfView();
    const newAltitude = direction === 'in' ? Math.max(0.1, currentPov.altitude - 0.5) : Math.min(4, currentPov.altitude + 0.5);
    globeEl.current.pointOfView({ ...currentPov, altitude: newAltitude }, 500);
  };

  const handleSelectStation = (station: RadioStation) => {
    setCurrentStation(station);
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: station.lat, lng: station.lng, altitude: 0.4 }, 2000);
    }
    // UX Profissional: No celular, o diretório fecha sozinho ao escolher a rádio
    if (isMobile) setIsSidebarOpen(false);
  };

  const pixPayloadEncoded = "00020126460014BR.GOV.BCB.PIX0124moacirsistemax%40gmail.com5204000053039865802BR5916Moacir%20Fernandes6014Rio%20de%20Janeiro62070503%2A%2A%2A63044DAB";

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
      
      {/* CSS OTIMIZADO PARA TODOS OS DISPOSITIVOS */}
      <style>{`
        /* Cursor Personalizado */
        .globe-cursor-wrapper { position: absolute; inset: 0; cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size:26px'><text y='26'>🦅</text></svg>") 16 16, auto !important; }
        .globe-cursor-wrapper:active { cursor: grabbing !important; }
        .globe-cursor-wrapper canvas { cursor: inherit !important; }

        /* Container de Interface Invisível para Flexbox */
        .ui-overlay { position: absolute; inset: 0; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; z-index: 50; }
        .ui-overlay > * { pointer-events: auto; }
        
        .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .bottom-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }

        /* Reset forçado para o Player.tsx se comportar dentro do flexbox */
        #player-box > div { position: relative !important; bottom: 0 !important; right: 0 !important; margin: 0 !important; box-sizing: border-box !important; width: 100% !important; }
        #player-box { width: 300px; }

        /* RESPONSIVIDADE: CELULAR EM PÉ (Portrait) */
        @media (max-width: 768px) and (orientation: portrait) {
          .ui-overlay { padding: 15px; }
          .bottom-row { flex-direction: column-reverse; align-items: center; gap: 15px; }
          #player-box { width: 100%; max-width: 400px; }
          .qr-box { width: 100%; max-width: 400px; justify-content: center; }
          .zoom-btn-group { display: none !important; } /* Oculta +/- porque celular usa pinça */
        }

        /* RESPONSIVIDADE: CELULAR DEITADO (Landscape) */
        @media (max-height: 500px) and (orientation: landscape) {
          .ui-overlay { padding: 10px; }
          .bottom-row { align-items: flex-end; }
          #player-box { transform: scale(0.85); transform-origin: bottom right; width: 260px; }
          .qr-box { transform: scale(0.85); transform-origin: bottom left; }
          .zoom-btn-group { display: none !important; }
        }
      `}</style>

      {/* TELA DE LOADING */}
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, background: '#020617', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '26px', letterSpacing: '3px', marginBottom: '8px', color: '#f8fafc' }}>Welcome RadioMoa</h2>
          <p style={{ color: '#06b6d4', fontSize: '14px', letterSpacing: '2px', fontWeight: 600 }}>Loading... GPS</p>
        </div>
      )}

      <div className="globe-cursor-wrapper">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          labelsData={WORLD_COUNTRIES}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={0.6}
          labelDotRadius={0}
          labelColor={() => 'rgba(241, 245, 249, 0.85)'}
          labelAltitude={0.01}
          labelResolution={2}

          pointsData={stations}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: any) => favorites.includes(d.streamUrl) ? '#fbbf24' : '#06b6d4'}
          pointAltitude={0.01}
          pointRadius={(d: any) => favorites.includes(d.streamUrl) ? 0.2 : 0.12}
          pointsMerge={false}

          ringsData={stations}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: any) => favorites.includes(d.streamUrl) ? '#fbbf24' : '#06b6d4'}
          ringMaxRadius={1.8}
          ringPropagationSpeed={1.5}
          ringRepeatPeriod={1200}
          
          onPointClick={(point) => handleSelectStation(point as RadioStation)}
        />
      </div>

      {/* PAINEL LATERAL (Z-Index menor que os botões para não cobrir o clique) */}
      <div style={{ position: 'absolute', zIndex: 40, top: 0, left: 0 }}>
        <Sidebar isOpen={isSidebarOpen} stations={stations} onSelectStation={handleSelectStation} width={SIDEBAR_WIDTH} favorites={favorites} toggleFavorite={toggleFavorite} />
      </div>

      {/* CAMADA DE INTERFACE FLEXÍVEL (Botões, Player, Pix) */}
      <div className="ui-overlay">
        
        {/* TOPO: Botão Menu + Zoom */}
        <div className="top-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', 
            // Lógica do Botão: Se fechar, fica na esquerda (0). Se abrir no celular, vai pra direita para não sumir!
            transform: isSidebarOpen ? (isMobile ? `translateX(calc(${windowSize.width}px - 140px))` : `translateX(${SIDEBAR_WIDTH}px)`) : 'translateX(0)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'rgba(15, 23, 42, 0.7)', color: '#00f6ff', border: '1px solid rgba(6, 182, 212, 0.5)',
                padding: '10px 16px', fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                borderRadius: '8px', backdropFilter: 'blur(10px)', letterSpacing: '1.5px', transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', outline: 'none', width: 'max-content'
              }}
            >
              {isSidebarOpen ? (isMobile ? '✖ CLOSE' : '◀ HIDE DIRECTORY') : '☰ SHOW DIRECTORY'}
            </button>

            {isSidebarOpen && !isMobile && (
              <div style={{ color: '#06b6d4', fontFamily: 'sans-serif', pointerEvents: 'none', background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: '8px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '2px', textShadow: '0 0 10px rgba(6,182,212,0.8)' }}>GPS SYSTEM</h1>
                <p style={{ margin: '4px 0 0 0', color: '#e2e8f0', fontSize: '11px', letterSpacing: '1px' }}>NETWORK: <span style={{ color: '#10b981', fontWeight: 'bold' }}>ONLINE</span></p>
              </div>
            )}
          </div>

          <div className="zoom-btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => handleZoom('in')} style={zoomBtnStyle}>+</button>
            <button onClick={() => handleZoom('out')} style={zoomBtnStyle}>-</button>
          </div>
        </div>

        {/* RODAPÉ: Pix + Player (Desaparecem no celular se o menu estiver aberto para liberar a tela) */}
        <div className="bottom-row" style={{ display: (isMobile && isSidebarOpen) ? 'none' : 'flex' }}>
          
          <div className="qr-box" style={{
            display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(2, 6, 23, 0.75)', padding: '12px 16px', 
            borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', fontFamily: 'sans-serif'
          }}>
            <div style={{ background: '#ffffff', padding: '4px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.8)', flexShrink: 0 }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixPayloadEncoded}&color=000000&bgcolor=ffffff`} alt="Pix QR Code" style={{ width: '55px', height: '55px', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
              <span style={{ color: '#fbbf24', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>SUPPORT PROJECT</span>
              <span style={{ color: '#f8fafc', fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                PIX: <strong style={{ color: '#06b6d4' }}>moacirsistemax@gmail.com</strong>
              </span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>© 2026 Moacir Fernandes</span>
            </div>
          </div>

          <div id="player-box">
            <Player station={currentStation} favorites={favorites} toggleFavorite={toggleFavorite} />
          </div>

        </div>

      </div>
    </div>
  );
}

const zoomBtnStyle = {
  background: 'rgba(15, 23, 42, 0.7)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.4)', 
  width: '44px', height: '44px', fontSize: '24px', cursor: 'pointer', borderRadius: '8px',
  backdropFilter: 'blur(10px)', transition: '0.2s', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
};