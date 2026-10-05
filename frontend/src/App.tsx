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
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SIDEBAR_WIDTH = 340; // No telemóvel a Sidebar ocupará 100vw, gerido no Sidebar.tsx

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
    // Fecha a sidebar no telemóvel ao selecionar rádio
    if (isMobile) setIsSidebarOpen(false);
  };

  const pixPayloadEncoded = "00020126460014BR.GOV.BCB.PIX0124moacirsistemax%40gmail.com5204000053039865802BR5916Moacir%20Fernandes6014Rio%20de%20Janeiro62070503%2A%2A%2A63044DAB";

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
      
      <style>{`
        .globe-cursor-wrapper { position: absolute; inset: 0; cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size:26px'><text y='26'>🦅</text></svg>") 16 16, auto !important; }
        .globe-cursor-wrapper:active { cursor: grabbing !important; }
        .globe-cursor-wrapper canvas { cursor: inherit !important; }

        /* Esconder UI no mobile se a sidebar estiver aberta (para não colidir visualmente) */
        .hide-on-mobile-sidebar {
          display: flex;
        }

        @media (max-width: 768px) {
          .zoom-controls { display: none !important; } /* Oculta +/- no telemóvel */
          
          /* Se a sidebar estiver aberta, esconde os controlos inferiores para não sobrepor */
          .sidebar-open .hide-on-mobile-sidebar {
            display: none !important;
          }

          .player-container {
            bottom: auto !important;
            top: 70px !important; /* Move o player para o topo no telemóvel */
            right: 15px !important;
            left: 15px !important;
            width: auto !important;
          }
          
          .player-container > div {
            width: 100% !important;
            box-sizing: border-box;
          }

          .footer-container {
            left: 15px !important;
            right: 15px !important;
            bottom: 15px !important;
            padding: 8px 12px !important;
            flex-direction: row !important;
          }
        }
        
        /* Landscape Mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .player-container {
            top: auto !important;
            bottom: 15px !important;
            right: 15px !important;
            left: auto !important;
            width: 250px !important;
            transform: scale(0.9);
            transform-origin: bottom right;
          }
          .footer-container {
            left: 15px !important;
            bottom: 15px !important;
            width: 250px !important;
            padding: 8px !important;
            transform: scale(0.9);
            transform-origin: bottom left;
          }
        }
      `}</style>

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

      {/* Envolvente principal para controlo de classes no telemóvel */}
      <div className={isSidebarOpen ? "sidebar-open" : ""}>
        
        <Sidebar isOpen={isSidebarOpen} stations={stations} onSelectStation={handleSelectStation} width={SIDEBAR_WIDTH} favorites={favorites} toggleFavorite={toggleFavorite} />

        {/* BOTÃO DO MENU (SEMPRE VISÍVEL POR CIMA DE TUDO - Z-INDEX 60) */}
        <div style={{
          position: 'absolute', top: 15, 
          // Se for mobile, fica na esquerda, se desktop, empurra consoante a largura da sidebar
          left: isMobile ? 15 : (isSidebarOpen ? SIDEBAR_WIDTH + 20 : 20), 
          transition: 'left 0.3s ease-out', 
          zIndex: 60, display: 'flex', flexDirection: 'column', gap: '15px'
        }}>
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

        {/* ZOOM CONTROLS (Ocultos no Mobile) */}
        <div className="zoom-controls" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
          <button onClick={() => handleZoom('in')} style={zoomBtnStyle}>+</button>
          <button onClick={() => handleZoom('out')} style={zoomBtnStyle}>-</button>
        </div>

        {/* PLAYER DE ÁUDIO */}
        {currentStation && (
          <div className="player-container hide-on-mobile-sidebar" style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 25, width: '280px' }}>
            <Player station={currentStation} favorites={favorites} toggleFavorite={toggleFavorite} />
          </div>
        )}

        {/* FOOTER PIX */}
        <div className="footer-container hide-on-mobile-sidebar" style={{
          position: 'absolute', bottom: 20, left: 20, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(2, 6, 23, 0.85)', padding: '10px 14px', borderRadius: '12px',
          border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', fontFamily: 'sans-serif'
        }}>
          <div style={{ background: '#ffffff', padding: '4px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.8)', flexShrink: 0 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixPayloadEncoded}&color=000000&bgcolor=ffffff`}
              alt="Pix QR Code" 
              style={{ width: '45px', height: '45px', display: 'block' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span style={{ color: '#fbbf24', fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px' }}>SUPPORT PROJECT</span>
            <span style={{ color: '#f8fafc', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              PIX: <strong style={{ color: '#06b6d4' }}>moacirsistemax@gmail.com</strong>
            </span>
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