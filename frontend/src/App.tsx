import { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { fetchGlobalStations } from './data/radios';
import type { RadioStation } from './types';

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
  
  // Deteta se é dispositivo móvel para lógicas de JavaScript (como o Sidebar fechar ao clicar)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SIDEBAR_WIDTH = 340; 

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
    if (isMobile) setIsSidebarOpen(false);
  };

  const pixPayloadEncoded = "00020126460014BR.GOV.BCB.PIX0124moacirsistemax%40gmail.com5204000053039865802BR5916Moacir%20Fernandes6014Rio%20de%20Janeiro62070503%2A%2A%2A63044DAB";

  return (
    <div style={{ width: '100vw', height: '100dvh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
      
      {/* 
        A MÁGICA DA RESPONSIVIDADE ACONTECE AQUI:
        Uso de Media Queries precisas e '100dvh' para ignorar as barras do navegador no mobile.
      */}
      <style>{`
        /* Cursor Personalizado (só aparece em ecrãs com rato) */
        @media (hover: hover) and (pointer: fine) {
          .globe-cursor-wrapper { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size:26px'><text y='26'>🦅</text></svg>") 16 16, auto !important; }
          .globe-cursor-wrapper:active { cursor: grabbing !important; }
          .globe-cursor-wrapper canvas { cursor: inherit !important; }
        }

        .globe-cursor-wrapper { position: absolute; inset: 0; }

        /* --- CLASSES BASE (DESKTOP) --- */
        .ui-container {
          position: absolute; inset: 0; padding: 20px;
          pointer-events: none; /* Deixa o clique passar para o globo */
          display: grid;
          grid-template-areas: 
            "top-left top-right"
            "mid-left mid-right"
            "bottom-left bottom-right";
          grid-template-rows: auto 1fr auto;
          grid-template-columns: 1fr auto;
          z-index: 30;
        }
        
        .ui-container > * { pointer-events: auto; } /* Ativa os cliques nos botões/UI */

        .top-left-area { grid-area: top-left; display: flex; flex-direction: column; gap: 10px; transition: transform 0.3s ease; }
        .mid-right-area { grid-area: mid-right; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
        .bottom-left-area { grid-area: bottom-left; align-self: flex-end; }
        .bottom-right-area { grid-area: bottom-right; align-self: flex-end; }

        /* Ajuste do botão do Menu quando a sidebar abre no Desktop */
        @media (min-width: 769px) {
          .menu-shifted { transform: translateX(360px); }
        }

        /* --- RESPONSIVIDADE MOBILE (PORTRAIT / EM PÉ) --- */
        @media (max-width: 768px) and (orientation: portrait) {
          .ui-container {
            padding: 15px 15px max(15px, env(safe-area-inset-bottom)); /* Previne corte pela barra do Android/iOS */
            grid-template-areas: 
              "top-left mid-right"
              "player player"
              "bottom-left bottom-left";
            grid-template-rows: auto 1fr auto;
            grid-template-columns: 1fr auto;
            gap: 10px;
          }

          /* O botão do menu fica sempre fixo em cima à esquerda, mesmo com sidebar aberta */
          .top-left-area { transform: none !important; z-index: 60; }
          
          /* Os botões de zoom sobem para o topo à direita */
          .mid-right-area { justify-content: flex-start; }
          .zoom-btn { width: 38px !important; height: 38px !important; fontSize: 20px !important; }

          /* O Player de áudio move-se para o meio, logo acima do Pix */
          .bottom-right-area { grid-area: player; width: 100%; align-self: end; margin-bottom: 10px; }
          .player-wrapper > div { width: 100% !important; box-sizing: border-box; } /* Força o player a ocupar a largura total */

          /* O QR Code (Pix) ocupa a largura total na base */
          .bottom-left-area { width: 100%; }
          .pix-box { width: 100%; box-sizing: border-box; padding: 10px !important; }
          .pix-box img { width: 45px !important; height: 45px !important; }

          /* Se a Sidebar estiver aberta no mobile, esconde o Player e o Pix para não poluir o ecrã */
          .hide-when-sidebar-open { display: none !important; }
        }

        /* --- RESPONSIVIDADE MOBILE (LANDSCAPE / DEITADO) --- */
        @media (max-height: 500px) and (max-width: 950px) and (orientation: landscape) {
          .ui-container {
            padding: 10px 15px max(10px, env(safe-area-inset-bottom));
            grid-template-areas: 
              "top-left mid-right"
              "bottom-left bottom-right";
            grid-template-rows: 1fr auto;
            grid-template-columns: 1fr auto;
          }
          
          .top-left-area { transform: none !important; z-index: 60; }
          
          /* Reduz o tamanho do Pix para caber melhor */
          .bottom-left-area { align-self: end; }
          .pix-box { padding: 8px 12px !important; }
          .pix-box img { width: 35px !important; height: 35px !important; }
          .pix-texts { transform: scale(0.85); transform-origin: left center; }

          /* Reduz e posiciona o player no canto inferior direito */
          .bottom-right-area { align-self: end; }
          .player-wrapper { transform: scale(0.8); transform-origin: bottom right; width: 300px; margin-right: -20px; margin-bottom: -10px; }

          .hide-when-sidebar-open { display: none !important; }
        }
      `}</style>

      {/* TELA DE LOADING */}
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, background: '#020617', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '26px', letterSpacing: '3px', marginBottom: '8px', color: '#f8fafc' }}>Welcome RadioMoa</h2>
          <p style={{ color: '#06b6d4', fontSize: '14px', letterSpacing: '2px', fontWeight: 600 }}>Loading... GPS</p>
        </div>
      )}

      {/* GLOBO */}
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

      {/* SIDEBAR (Por baixo da UI Container, mas recebe cliques) */}
      <div style={{ position: 'absolute', zIndex: 20, top: 0, left: 0 }}>
        <Sidebar isOpen={isSidebarOpen} stations={stations} onSelectStation={handleSelectStation} width={SIDEBAR_WIDTH} favorites={favorites} toggleFavorite={toggleFavorite} />
      </div>

      {/* UI CONTAINER (Grelha Responsiva) */}
      <div className="ui-container">
        
        {/* TOPO ESQUERDA: Botão Menu */}
        <div className={`top-left-area ${isSidebarOpen && !isMobile ? 'menu-shifted' : ''}`}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)', color: '#00f6ff', border: '1px solid rgba(6, 182, 212, 0.5)',
              padding: '10px 16px', fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              borderRadius: '8px', backdropFilter: 'blur(10px)', letterSpacing: '1.5px', transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)', outline: 'none', width: 'max-content'
            }}
          >
            {isSidebarOpen ? (isMobile ? '✖ CLOSE DIRECTORY' : '◀ HIDE DIRECTORY') : '☰ SHOW DIRECTORY'}
          </button>
        </div>

        {/* MEIO DIREITA: Zoom Controls (Restaurados para mobile) */}
        <div className="mid-right-area">
          <button className="zoom-btn" onClick={() => handleZoom('in')} style={zoomBtnStyle}>+</button>
          <button className="zoom-btn" onClick={() => handleZoom('out')} style={zoomBtnStyle}>-</button>
        </div>

        {/* BAIXO ESQUERDA: Pix QR Code */}
        <div className={`bottom-left-area ${isMobile && isSidebarOpen ? 'hide-when-sidebar-open' : ''}`}>
          <div className="pix-box" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(2, 6, 23, 0.85)', padding: '12px 16px', borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', fontFamily: 'sans-serif'
          }}>
            <div style={{ background: '#ffffff', padding: '4px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.8)', flexShrink: 0 }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixPayloadEncoded}&color=000000&bgcolor=ffffff`}
                alt="Pix QR Code" 
                style={{ width: '55px', height: '55px', display: 'block' }} 
              />
            </div>
            <div className="pix-texts" style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
              <span style={{ color: '#fbbf24', fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px' }}>SUPPORT PROJECT</span>
              <span style={{ color: '#f8fafc', fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                PIX: <strong style={{ color: '#06b6d4' }}>moacirsistemax@gmail.com</strong>
              </span>
              <span style={{ color: '#64748b', fontSize: '9px' }}>© 2026 Moacir Fernandes</span>
            </div>
          </div>
        </div>

        {/* BAIXO DIREITA: Player de Áudio */}
        <div className={`bottom-right-area ${isMobile && isSidebarOpen ? 'hide-when-sidebar-open' : ''}`}>
          {currentStation && (
            <div className="player-wrapper" style={{ width: isMobile ? '100%' : '280px' }}>
              <Player station={currentStation} favorites={favorites} toggleFavorite={toggleFavorite} />
            </div>
          )}
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