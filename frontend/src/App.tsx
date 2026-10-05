import { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { fetchGlobalStations } from './data/radios';
import type { RadioStation } from './types';

// Principais países globais com coordenadas centrais para o modo "visão de longe" estilo Google Earth
const COUNTRIES_OVERVIEW = [
  { name: 'BRAZIL', lat: -14.2350, lng: -51.9253 },
  { name: 'USA', lat: 37.0902, lng: -95.7129 },
  { name: 'FRANCE', lat: 46.6034, lng: 1.8883 },
  { name: 'GERMANY', lat: 51.1657, lng: 10.4515 },
  { name: 'UNITED KINGDOM', lat: 55.3781, lng: -3.4360 },
  { name: 'JAPAN', lat: 36.2048, lng: 138.2529 },
  { name: 'AUSTRALIA', lat: -25.2744, lng: 133.7751 },
  { name: 'CANADA', lat: 56.1304, lng: -106.3468 },
  { name: 'ARGENTINA', lat: -38.4161, lng: -63.6167 },
  { name: 'SOUTH AFRICA', lat: -30.5595, lng: 22.9375 },
  { name: 'SPAIN', lat: 40.4637, lng: -3.7492 },
  { name: 'ITALY', lat: 41.8719, lng: 12.5674 }
];

export default function App() {
  const globeEl = useRef<any>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controla a altitude atual do globo para decidir se mostra países ou cidades
  const [globeAltitude, setGlobeAltitude] = useState<number>(2.5);

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
    setGlobeAltitude(newAltitude);
  };

  const handleSelectStation = (station: RadioStation) => {
    setCurrentStation(station);
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: station.lat, lng: station.lng, altitude: 0.4 }, 2000);
      setGlobeAltitude(0.4);
    }
  };

  const pixPayloadEncoded = "00020126460014BR.GOV.BCB.PIX0124moacirsistemax%40gmail.com5204000053039865802BR5916Moacir%20Fernandes6014Rio%20de%20Janeiro62070503%2A%2A%2A63044DAB";

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
      
      <style>{`
        .globe-cursor-wrapper {
          position: absolute;
          inset: 0;
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size:26px'><text y='26'>🦅</text></svg>") 16 16, auto !important;
        }
        .globe-cursor-wrapper:active {
          cursor: grabbing !important;
        }
        .globe-cursor-wrapper canvas {
          cursor: inherit !important;
        }
      `}</style>

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

      <div className="globe-cursor-wrapper">
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
          
          // ESTRUTURA ESTILO GOOGLE EARTH:
          // Se o usuário estiver afastado (altitude > 1.2), mostra apenas os nomes dos países.
          // Se aproximar o zoom (altitude <= 1.2), mostra os nomes detalhados das cidades/rádios.
          labelsData={globeAltitude > 1.2 ? COUNTRIES_OVERVIEW : stations}
          labelLat="lat"
          labelLng="lng"
          labelText={(d: any) => globeAltitude > 1.2 ? d.name : d.city}
          labelSize={() => globeAltitude > 1.2 ? 0.7 : 0.4}
          labelDotRadius={0}
          labelColor={(d: any) => globeAltitude > 1.2 ? 'rgba(255, 255, 255, 0.75)' : (favorites.includes(d.streamUrl) ? '#fbbf24' : '#06b6d4')}
          labelAltitude={0.02}
          labelResolution={2}

          onPointClick={(point) => handleSelectStation(point as RadioStation)}
          onLabelClick={(label) => {
            if (globeAltitude <= 1.2) handleSelectStation(label as RadioStation);
          }}
          onZoom={({ altitude }) => setGlobeAltitude(altitude)}
        />
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        stations={stations} 
        onSelectStation={handleSelectStation} 
        width={SIDEBAR_WIDTH} 
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

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

        {isSidebarOpen && (
          <div style={{ color: '#06b6d4', fontFamily: 'sans-serif', pointerEvents: 'none', background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: '8px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '2px', textShadow: '0 0 10px rgba(6,182,212,0.8)' }}>GPS SYSTEM</h1>
            <p style={{ margin: '4px 0 0 0', color: '#e2e8f0', fontSize: '11px', letterSpacing: '1px' }}>
              NETWORK: <span style={{ color: '#10b981', fontWeight: 'bold' }}>ONLINE</span> | {stations.length} STATIONS
            </p>
          </div>
        )}
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

      <div style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: '15px',
        background: 'rgba(2, 6, 23, 0.75)', padding: '12px 16px', borderRadius: '12px',
        border: '1px solid rgba(6, 182, 212, 0.25)', backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', fontFamily: 'sans-serif'
      }}>
        <div style={{ background: '#ffffff', padding: '4px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.8)' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixPayloadEncoded}&color=000000&bgcolor=ffffff`}
            alt="Pix QR Code" 
            style={{ width: '60px', height: '60px', display: 'block' }} 
          />
        </div>
        
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