import { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { fetchGlobalStations } from './data/radios';
import { useI18n } from './i18n';
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
  { name: 'Mexico', lat: 23.6345, lng: -102.5528 },
];

const EBOOKS = [
  { title: 'Eng. de Software e Banco de Dados', url: 'https://go.hotmart.com/L108214592F' },
  { title: 'Fundamentos e Indústria 4.0', url: 'https://go.hotmart.com/V108213402L' },
  { title: 'Gestão de Projetos e Startups', url: 'https://go.hotmart.com/N108214728C' },
  { title: 'Guia Prático de Deploy & Ágil', url: 'https://go.hotmart.com/F108230377L' },
  { title: 'IA Vertical com ChatGPT', url: 'https://go.hotmart.com/L108230120I' },
  { title: 'Trilha: Desenv. Sistemas (Combo)', url: 'https://go.hotmart.com/X108214950O' },
];

const PIX_KEY = 'moacirsistemax@gmail.com';
const PIX_PAYLOAD =
  '00020126460014BR.GOV.BCB.PIX0124moacirsistemax%40gmail.com5204000053039865802BR5916Moacir%20Fernandes6014Rio%20de%20Janeiro62070503%2A%2A%2A63044DAB';
const PIX_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${PIX_PAYLOAD}&color=000000&bgcolor=ffffff`;

const MOBILE_MAX = 768;

type PanelId = 'ebooks' | 'pix' | null;

function useViewport() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    const onOrientation = () => setTimeout(update, 300);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', onOrientation);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', onOrientation);
    };
  }, []);

  return size;
}

export default function App() {
  const globeEl = useRef<any>(null);
  const dragTimer = useRef<number | null>(null);
  const { lang, setLang, t } = useI18n();

  const [stations, setStations] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<PanelId>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gps_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { width, height } = useViewport();
  const isMobile = width <= MOBILE_MAX;

  useEffect(() => {
    fetchGlobalStations()
      .then((data) => setStations(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    return () => {
      if (dragTimer.current) window.clearTimeout(dragTimer.current);
    };
  }, []);

  const toggleFavorite = (streamUrl: string) => {
    setFavorites((prev) =>
      prev.includes(streamUrl) ? prev.filter((u) => u !== streamUrl) : [...prev, streamUrl]
    );
  };

  const beginDrag = () => {
    if (dragTimer.current) window.clearTimeout(dragTimer.current);
    setIsDragging(true);
    setOpenPanel(null);
  };

  const endDrag = () => {
    if (dragTimer.current) window.clearTimeout(dragTimer.current);
    dragTimer.current = window.setTimeout(() => setIsDragging(false), 450);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const globe = globeEl.current;
    if (!globe) return;
    const pov = globe.pointOfView();
    const altitude =
      direction === 'in' ? Math.max(0.1, pov.altitude - 0.5) : Math.min(4, pov.altitude + 0.5);
    globe.pointOfView({ ...pov, altitude }, 500);
  };

  const handleSelectStation = (station: RadioStation) => {
    setCurrentStation(station);
    setShowPlayer(true);
    setOpenPanel(null);
    if (isMobile) setIsSidebarOpen(false);
    globeEl.current?.pointOfView(
      { lat: station.lat, lng: station.lng, altitude: isMobile ? 1.1 : 0.8 },
      1800
    );
  };

  const togglePanel = (id: Exclude<PanelId, null>) => {
    setOpenPanel((prev) => (prev === id ? null : id));
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className={`app${isDragging ? ' is-dragging' : ''}`}>
      {isLoading && (
        <div className="loader">
          <div className="loader-ring" />
          <h1>Welcome RadioMoa</h1>
          <p>{t('loading')}</p>
        </div>
      )}

      {/* GLOBO */}
      <div
        className="globe-layer"
        onPointerDown={beginDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onWheel={() => {
          beginDrag();
          endDrag();
        }}
      >
        <Globe
          ref={globeEl}
          width={width}
          height={height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          labelsData={WORLD_COUNTRIES}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={isMobile ? 0.45 : 0.6}
          labelDotRadius={0}
          labelColor={() => 'rgba(241, 245, 249, 0.85)'}
          labelAltitude={0.01}
          labelResolution={2}
          pointsData={stations}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: any) => (favorites.includes(d.streamUrl) ? '#fbbf24' : '#22d3ee')}
          pointAltitude={0.02}
          pointRadius={(d: any) => (favorites.includes(d.streamUrl) ? 0.6 : 0.45)}
          pointsMerge={false}
          ringsData={stations}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: any) => (favorites.includes(d.streamUrl) ? '#fbbf24' : '#22d3ee')}
          ringMaxRadius={2.5}
          ringPropagationSpeed={1.5}
          ringRepeatPeriod={1200}
          onPointClick={(point) => handleSelectStation(point as RadioStation)}
        />
      </div>

      {/* DIRETÓRIO */}
      <Sidebar
        isOpen={isSidebarOpen}
        stations={stations}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onSelectStation={handleSelectStation}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* TOPO: DIRETÓRIO + IDIOMA + MARCA */}
      <header className={`topbar${isSidebarOpen && !isMobile ? ' is-shifted' : ''}`}>
        <button
          className="btn-directory"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen((o) => !o)}
        >
          <span className="burger">
            <i />
            <i />
            <i />
          </span>
          <span>{isSidebarOpen && !isMobile ? t('hide') : t('directory')}</span>
        </button>

        <div className="lang-switch" role="group" aria-label={t('language')}>
          <button
            className={lang === 'en' ? 'is-on' : ''}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={lang === 'pt' ? 'is-on' : ''}
            aria-pressed={lang === 'pt'}
            onClick={() => setLang('pt')}
          >
            PT
          </button>
        </div>

        <div className="brand">
          <span className="brand-dot" />
          <span>RadioMoa</span>
          <span className="brand-count">
            {stations.length} {t('stationsLive')}
          </span>
        </div>
      </header>

      {/* PLAYER */}
      {currentStation && (
        <div className={`player-dock${showPlayer ? ' is-open' : ''}`}>
          <Player
            station={currentStation}
            active={showPlayer}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onClose={() => setShowPlayer(false)}
          />
        </div>
      )}

      {currentStation && !showPlayer && (
        <button className="player-reopen" onClick={() => setShowPlayer(true)} aria-label={t('reopenPlayer')}>
          <span className="live-dot" />
          <span className="txt">{currentStation.name}</span>
        </button>
      )}

      {/* ZOOM */}
      <div className="zoom">
        <button onClick={() => handleZoom('in')} aria-label={t('zoomIn')}>+</button>
        <button onClick={() => handleZoom('out')} aria-label={t('zoomOut')}>−</button>
      </div>

      {/* PAINÉIS INFERIORES */}
      <div className="dock">
        <div className={`panel panel-pix${openPanel === 'pix' ? ' is-open' : ''}`}>
          <button
            className="panel-toggle"
            aria-expanded={openPanel === 'pix'}
            onClick={() => togglePanel('pix')}
          >
            <span className="heart">♥</span>
            <span>{t('supportProject')}</span>
            <span className="chev" />
          </button>
          <div className="panel-body">
            <div className="pix-card">
              <div className="pix-qr">
                <img src={PIX_QR_URL} alt={t('qrAlt')} />
              </div>
              <div className="pix-info">
                <span className="eyebrow">Pix</span>
                <span className="pix-key">{PIX_KEY}</span>
                <button className="copy-btn" onClick={copyPix}>
                  {copied ? t('copied') : t('copyKey')}
                </button>
              </div>
            </div>
            <p className="panel-foot">© 2026 Moacir Fernandes</p>
          </div>
        </div>

        <div className={`panel panel-ebooks${openPanel === 'ebooks' ? ' is-open' : ''}`}>
          <button
            className="panel-toggle"
            aria-expanded={openPanel === 'ebooks'}
            onClick={() => togglePanel('ebooks')}
          >
            <span>{t('studyMaterials')}</span>
            <span className="chev" />
          </button>
          <div className="panel-body">
            <p className="eyebrow">{t('techTitle')}</p>
            <ul className="ebook-list">
              {EBOOKS.map((e) => (
                <li key={e.url}>
                  <a className="ebook-link" href={e.url} target="_blank" rel="noopener noreferrer">
                    <span>{e.title}</span>
                    <span className="arrow">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}