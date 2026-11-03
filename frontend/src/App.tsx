import { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { fetchGlobalStations } from './data/radios';
import type { RadioStation } from './types';
import './App.css';

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
  
  const [isInteracting, setIsInteracting] = useState(false);
  const interactTimeout = useRef<any>(null);
  
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

  const triggerInteraction = () => {
    setIsInteracting(true);
    if (interactTimeout.current) clearTimeout(interactTimeout.current);
    interactTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, 600); 
  };

  const handleZoom = (direction: 'in' | 'out') => {
    triggerInteraction();
    if (!globeEl.current) return;
    const currentPov = globeEl.current.pointOfView();
    const newAltitude = direction === 'in' ? Math.max(0.1, currentPov.altitude - 0.5) : Math.min(4, currentPov.altitude + 0.5);
    globeEl.current.pointOfView({ ...currentPov, altitude: newAltitude }, 500);
  };

  const handleSelectStation = (station: RadioStation) => {
    setCurrentStation(station);
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: station.lat, lng: station.lng, altitude: 0.8 }, 2000);
    }
    if (isMobile) setIsSidebarOpen(false);
  };

  const pixPayloadEncoded = "00020126460014BR.GOV.BCB.PIX0124moacirsistemax%40gmail.com5204000053039865802BR5916Moacir%20Fernandes6014Rio%20de%20Janeiro62070503%2A%2A%2A63044DAB";

  return (
    <div style={{ width: '100vw', height: '100dvh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>

      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, background: '#020617', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '26px', letterSpacing: '3px', marginBottom: '8px', color: '#f8fafc' }}>Welcome RadioMoa</h2>
          <p style={{ color: '#06b6d4', fontSize: '14px', letterSpacing: '2px', fontWeight: 600 }}>Loading... GPS</p>
        </div>
      )}

      {/* ÁREA DO GLOBO */}
      <div 
        className="globe-cursor-wrapper"
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => triggerInteraction()}
        onPointerLeave={() => setIsInteracting(false)}
        onWheel={() => triggerInteraction()}
      >
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
          pointAltitude={0.02}
          pointRadius={(d: any) => favorites.includes(d.streamUrl) ? 0.6 : 0.45}
          pointsMerge={false}

          ringsData={stations}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: any) => favorites.includes(d.streamUrl) ? '#fbbf24' : '#06b6d4'}
          ringMaxRadius={2.5}
          ringPropagationSpeed={1.5}
          ringRepeatPeriod={1200}
          
          onPointClick={(point) => handleSelectStation(point as RadioStation)}
        />
      </div>

      <div style={{ position: 'absolute', zIndex: 20, top: 0, left: 0 }}>
        <Sidebar isOpen={isSidebarOpen} stations={stations} onSelectStation={handleSelectStation} width={SIDEBAR_WIDTH} favorites={favorites} toggleFavorite={toggleFavorite} />
      </div>

      <div className="ui-container">
        
        {/* TOPO ESQUERDA: MENU */}
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

        {/* TOPO DIREITA: PLAYER COMPACTO */}
        <div className={`top-right-area ${isMobile && isSidebarOpen ? 'hide-when-sidebar-open' : ''}`}>
          {currentStation && (
            <div className="player-wrapper" style={{ width: isMobile ? '100%' : '160px' }}>
              <Player station={currentStation} favorites={favorites} toggleFavorite={toggleFavorite} />
            </div>
          )}
        </div>

        {/* MEIO DIREITA: BOTOES DE ZOOM */}
        <div className="mid-right-area">
          <button className="zoom-btn" onClick={() => handleZoom('in')} style={zoomBtnStyle}>+</button>
          <button className="zoom-btn" onClick={() => handleZoom('out')} style={zoomBtnStyle}>-</button>
        </div>

        {/* BAIXO ESQUERDA: FOOTER DO PIX */}
        <div className={`bottom-left-area ${isMobile && isSidebarOpen ? 'hide-when-sidebar-open' : ''}`}>
          <div className={`interactive-ui left ${isInteracting ? 'dimmed' : ''}`}>
            <div className="pix-box" style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              background: 'rgba(2, 6, 23, 0.85)', padding: '16px 20px', borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', fontFamily: 'sans-serif',
              width: 'max-content', maxWidth: '100%'
            }}>
              <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.8)', flexShrink: 0 }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixPayloadEncoded}&color=000000&bgcolor=ffffff`}
                  alt="Pix QR Code" 
                  style={{ width: '85px', height: '85px', display: 'block' }} 
                />
              </div>
              <div className="pix-texts" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>SUPPORT PROJECT</span>
                <span style={{ color: '#f8fafc', fontSize: '12px' }}>
                  PIX: <strong style={{ color: '#06b6d4', display: 'block', marginTop: '2px' }}>moacirsistemax@gmail.com</strong>
                </span>
                <span style={{ color: '#64748b', fontSize: '10px' }}>© 2026 Moacir Fernandes</span>
              </div>
            </div>
          </div>
        </div>

        {/* BAIXO DIREITA: FOOTER DE E-BOOKS */}
        <div className={`bottom-right-area ${isMobile && isSidebarOpen ? 'hide-when-sidebar-open' : ''}`}>
          <div className={`interactive-ui right ${isInteracting ? 'dimmed' : ''}`}>
            <div className="ebooks-container" style={{ 
              display: 'flex', flexDirection: 'column', gap: '8px',
              background: 'rgba(2, 6, 23, 0.85)', padding: '16px 20px', borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              width: 'max-content', maxWidth: '100%'
            }}>
              <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textAlign: 'right', marginBottom: '2px' }}>MATERIAL DE APOIO - TI & NEGÓCIOS</span>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: '20px', rowGap: '8px' }}>
                <a className="ebook-link" href="https://go.hotmart.com/L108214592F" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Eng. de Software e Banco de Dados</a>
                <a className="ebook-link" href="https://go.hotmart.com/V108213402L" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Fundamentos e Indústria 4.0</a>
                <a className="ebook-link" href="https://go.hotmart.com/N108214728C" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Gestão de Projetos e Startups</a>
                <a className="ebook-link" href="https://go.hotmart.com/F108230377L" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Guia Prático de Deploy & Ágil</a>
                <a className="ebook-link" href="https://go.hotmart.com/L108230120I" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• IA Vertical com ChatGPT</a>
                <a className="ebook-link" href="https://go.hotmart.com/X108214950O" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Trilha: Desenv. Sistemas (Combo)</a>
              </div>
            </div>
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