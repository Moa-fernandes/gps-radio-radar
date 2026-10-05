import { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { fetchGlobalStations } from './data/radios';
import type { RadioStation } from './types';

export default function App() {
  const globeEl = useRef<any>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Favorites State (LocalStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gps_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const SIDEBAR_WIDTH = 340;

  useEffect(() => {
    fetchGlobalStations().then((data) => {
      setStations(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (streamUrl: string) => {
    setFavorites(prev => 
      prev.includes(streamUrl) 
        ? prev.filter(url => url !== streamUrl) 
        : [...prev, streamUrl]
    );
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
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
      
      {/* LOADING SCREEN */}
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0, background: '#020617', zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#06b6d4', fontFamily: 'sans-serif'
        }}>
          <h2 style={{ fontSize: '26px', letterSpacing: '3px', marginBottom: '8px', color: '#f8fafc' }}>Welcome RadioMoa</h2>
          <p style={{ color: '#06b6d4', fontSize: '14px', letterSpacing: '2px', fontWeight: 600 }}>Loading... GPS</p>
        </div>
      )}

      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
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

      <Sidebar 
        isOpen={isSidebarOpen} 
        stations={stations} 
        onSelectStation={handleSelectStation} 
        width={SIDEBAR_WIDTH} 
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

      {/* HEADER / FLOATING MENU */}
      <div style={{
        position: 'absolute', top: 20, 
        left: isSidebarOpen ? SIDEBAR_WIDTH + 20 : 20, 
        transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        zIndex: 30, display: 'flex', flexDirection: 'column', gap: '15px'
      }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            background: 'rgba(15, 23, 42, 0.7)', color: '#00f6ff', border: '1px solid rgba(6, 182, 212, 0.5)',
            padding: '10px 16px', fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
            borderRadius: '8px', backdropFilter: 'blur(10px)', letterSpacing: '1.5px', transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)', outline: 'none', width: 'fit-content'
          }}
        >
          {isSidebarOpen ? '◀ HIDE DIRECTORY' : '☰ SHOW DIRECTORY'}
        </button>

        <div style={{ color: '#06b6d4', fontFamily: 'sans-serif', pointerEvents: 'none', background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: '8px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '2px', textShadow: '0 0 10px rgba(6,182,212,0.8)' }}>GPS SYSTEM</h1>
          <p style={{ margin: '4px 0 0 0', color: '#e2e8f0', fontSize: '11px', letterSpacing: '1px' }}>
            NETWORK: <span style={{ color: '#10b981', fontWeight: 'bold' }}>ONLINE</span> | {stations.length} STATIONS
          </p>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
        <button onClick={() => handleZoom('in')} style={zoomBtnStyle}>+</button>
        <button onClick={() => handleZoom('out')} style={zoomBtnStyle}>-</button>
      </div>

      <Player 
        station={currentStation} 
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

      {/* FOOTER: PIX & QR CODE */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: '15px',
        background: 'rgba(2, 6, 23, 0.75)', padding: '12px 16px', borderRadius: '12px',
        border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', fontFamily: 'sans-serif'
      }}>
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=moacirsistemax@gmail.com&color=06b6d4&bgcolor=020617" 
          alt="Pix QR Code" 
          style={{ width: '60px', height: '60px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.5)' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#fbbf24', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>SUPPORT THIS PROJECT</span>
          <span style={{ color: '#f8fafc', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            PIX: <strong style={{ color: '#06b6d4', letterSpacing: '0.5px' }}>moacirsistemax@gmail.com</strong>
          </span>
          <span style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>© 2026 Moacir Fernandes</span>
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