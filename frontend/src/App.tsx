import { useRef, useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import { fetchGlobalStations } from './data/radios';
import { useI18n } from './i18n';
import type { RadioStation } from './types';
import './App.css';

const WORLD_COUNTRIES = [
  // AFRICA
  { name: 'Algeria', lat: 28.03, lng: 1.66 },
  { name: 'Angola', lat: -11.2, lng: 17.87 },
  { name: 'Benin', lat: 9.31, lng: 2.32 },
  { name: 'Botswana', lat: -22.33, lng: 24.68 },
  { name: 'Burkina Faso', lat: 12.24, lng: -1.56 },
  { name: 'Burundi', lat: -3.37, lng: 29.92 },
  { name: 'Cabo Verde', lat: 16.54, lng: -23.04 },
  { name: 'Cameroon', lat: 7.37, lng: 12.35 },
  { name: 'Central African Republic', lat: 6.61, lng: 20.94 },
  { name: 'Chad', lat: 15.45, lng: 18.73 },
  { name: 'Comoros', lat: -11.88, lng: 43.87 },
  { name: 'Congo', lat: -0.23, lng: 15.83 },
  { name: 'DR Congo', lat: -4.04, lng: 21.76 },
  { name: "Cote d'Ivoire", lat: 7.54, lng: -5.55 },
  { name: 'Djibouti', lat: 11.83, lng: 42.59 },
  { name: 'Egypt', lat: 26.82, lng: 30.8 },
  { name: 'Equatorial Guinea', lat: 1.65, lng: 10.27 },
  { name: 'Eritrea', lat: 15.18, lng: 39.78 },
  { name: 'Eswatini', lat: -26.52, lng: 31.47 },
  { name: 'Ethiopia', lat: 9.15, lng: 40.49 },
  { name: 'Gabon', lat: -0.8, lng: 11.61 },
  { name: 'Gambia', lat: 13.44, lng: -15.31 },
  { name: 'Ghana', lat: 7.95, lng: -1.02 },
  { name: 'Guinea', lat: 9.95, lng: -9.7 },
  { name: 'Guinea-Bissau', lat: 11.8, lng: -15.18 },
  { name: 'Kenya', lat: -0.02, lng: 37.91 },
  { name: 'Lesotho', lat: -29.61, lng: 28.23 },
  { name: 'Liberia', lat: 6.43, lng: -9.43 },
  { name: 'Libya', lat: 26.34, lng: 17.23 },
  { name: 'Madagascar', lat: -18.77, lng: 46.87 },
  { name: 'Malawi', lat: -13.25, lng: 34.3 },
  { name: 'Mali', lat: 17.57, lng: -4.0 },
  { name: 'Mauritania', lat: 21.01, lng: -10.94 },
  { name: 'Mauritius', lat: -20.35, lng: 57.55 },
  { name: 'Morocco', lat: 31.79, lng: -7.09 },
  { name: 'Mozambique', lat: -18.67, lng: 35.53 },
  { name: 'Namibia', lat: -22.96, lng: 18.49 },
  { name: 'Niger', lat: 17.61, lng: 8.08 },
  { name: 'Nigeria', lat: 9.08, lng: 8.68 },
  { name: 'Rwanda', lat: -1.94, lng: 29.87 },
  { name: 'Sao Tome and Principe', lat: 0.19, lng: 6.61 },
  { name: 'Senegal', lat: 14.5, lng: -14.45 },
  { name: 'Seychelles', lat: -4.68, lng: 55.49 },
  { name: 'Sierra Leone', lat: 8.46, lng: -11.78 },
  { name: 'Somalia', lat: 5.15, lng: 46.2 },
  { name: 'South Africa', lat: -30.56, lng: 22.94 },
  { name: 'South Sudan', lat: 6.88, lng: 31.31 },
  { name: 'Sudan', lat: 12.86, lng: 30.22 },
  { name: 'Tanzania', lat: -6.37, lng: 34.89 },
  { name: 'Togo', lat: 8.62, lng: 0.82 },
  { name: 'Tunisia', lat: 33.89, lng: 9.54 },
  { name: 'Uganda', lat: 1.37, lng: 32.29 },
  { name: 'Zambia', lat: -13.13, lng: 27.85 },
  { name: 'Zimbabwe', lat: -19.02, lng: 29.15 },

  // EUROPE
  { name: 'Albania', lat: 41.15, lng: 20.17 },
  { name: 'Andorra', lat: 42.55, lng: 1.6 },
  { name: 'Austria', lat: 47.52, lng: 14.55 },
  { name: 'Belarus', lat: 53.71, lng: 27.95 },
  { name: 'Belgium', lat: 50.5, lng: 4.47 },
  { name: 'Bosnia and Herzegovina', lat: 43.92, lng: 17.68 },
  { name: 'Bulgaria', lat: 42.73, lng: 25.49 },
  { name: 'Croatia', lat: 45.1, lng: 15.2 },
  { name: 'Cyprus', lat: 35.13, lng: 33.43 },
  { name: 'Czechia', lat: 49.82, lng: 15.47 },
  { name: 'Denmark', lat: 56.26, lng: 9.5 },
  { name: 'Estonia', lat: 58.6, lng: 25.01 },
  { name: 'Finland', lat: 61.92, lng: 25.75 },
  { name: 'France', lat: 46.23, lng: 2.21 },
  { name: 'Germany', lat: 51.17, lng: 10.45 },
  { name: 'Greece', lat: 39.07, lng: 21.82 },
  { name: 'Hungary', lat: 47.16, lng: 19.5 },
  { name: 'Iceland', lat: 64.96, lng: -19.02 },
  { name: 'Ireland', lat: 53.41, lng: -8.24 },
  { name: 'Italy', lat: 41.87, lng: 12.57 },
  { name: 'Kosovo', lat: 42.6, lng: 20.9 },
  { name: 'Latvia', lat: 56.88, lng: 24.6 },
  { name: 'Liechtenstein', lat: 47.17, lng: 9.55 },
  { name: 'Lithuania', lat: 55.17, lng: 23.88 },
  { name: 'Luxembourg', lat: 49.82, lng: 6.13 },
  { name: 'Malta', lat: 35.94, lng: 14.38 },
  { name: 'Moldova', lat: 47.41, lng: 28.37 },
  { name: 'Monaco', lat: 43.73, lng: 7.42 },
  { name: 'Montenegro', lat: 42.71, lng: 19.37 },
  { name: 'Netherlands', lat: 52.13, lng: 5.29 },
  { name: 'North Macedonia', lat: 41.61, lng: 21.75 },
  { name: 'Norway', lat: 60.47, lng: 8.47 },
  { name: 'Poland', lat: 51.92, lng: 19.15 },
  { name: 'Portugal', lat: 39.4, lng: -8.22 },
  { name: 'Romania', lat: 45.94, lng: 24.97 },
  { name: 'Russia', lat: 61.52, lng: 105.32 },
  { name: 'San Marino', lat: 43.94, lng: 12.46 },
  { name: 'Serbia', lat: 44.02, lng: 21.01 },
  { name: 'Slovakia', lat: 48.67, lng: 19.7 },
  { name: 'Slovenia', lat: 46.15, lng: 14.99 },
  { name: 'Spain', lat: 40.46, lng: -3.75 },
  { name: 'Sweden', lat: 60.13, lng: 18.64 },
  { name: 'Switzerland', lat: 46.82, lng: 8.23 },
  { name: 'Ukraine', lat: 48.38, lng: 31.17 },
  { name: 'United Kingdom', lat: 55.38, lng: -3.44 },
  { name: 'Vatican City', lat: 41.9, lng: 12.45 },

  // ASIA
  { name: 'Afghanistan', lat: 33.94, lng: 67.71 },
  { name: 'Armenia', lat: 40.07, lng: 45.04 },
  { name: 'Azerbaijan', lat: 40.14, lng: 47.58 },
  { name: 'Bahrain', lat: 26.07, lng: 50.56 },
  { name: 'Bangladesh', lat: 23.68, lng: 90.36 },
  { name: 'Bhutan', lat: 27.51, lng: 90.43 },
  { name: 'Brunei', lat: 4.54, lng: 114.73 },
  { name: 'Cambodia', lat: 12.57, lng: 104.99 },
  { name: 'China', lat: 35.86, lng: 104.2 },
  { name: 'Georgia', lat: 42.32, lng: 43.36 },
  { name: 'India', lat: 20.59, lng: 78.96 },
  { name: 'Indonesia', lat: -0.79, lng: 113.92 },
  { name: 'Iran', lat: 32.43, lng: 53.69 },
  { name: 'Iraq', lat: 33.22, lng: 43.68 },
  { name: 'Israel', lat: 31.05, lng: 34.85 },
  { name: 'Japan', lat: 36.2, lng: 138.25 },
  { name: 'Jordan', lat: 30.59, lng: 36.24 },
  { name: 'Kazakhstan', lat: 48.02, lng: 66.92 },
  { name: 'Kuwait', lat: 29.31, lng: 47.48 },
  { name: 'Kyrgyzstan', lat: 41.2, lng: 74.77 },
  { name: 'Laos', lat: 19.86, lng: 102.5 },
  { name: 'Lebanon', lat: 33.85, lng: 35.86 },
  { name: 'Malaysia', lat: 4.21, lng: 101.98 },
  { name: 'Maldives', lat: 3.2, lng: 73.22 },
  { name: 'Mongolia', lat: 46.86, lng: 103.85 },
  { name: 'Myanmar', lat: 21.91, lng: 95.96 },
  { name: 'Nepal', lat: 28.39, lng: 84.12 },
  { name: 'North Korea', lat: 40.34, lng: 127.51 },
  { name: 'Oman', lat: 21.47, lng: 55.98 },
  { name: 'Pakistan', lat: 30.38, lng: 69.35 },
  { name: 'Palestine', lat: 31.95, lng: 35.23 },
  { name: 'Philippines', lat: 12.88, lng: 121.77 },
  { name: 'Qatar', lat: 25.35, lng: 51.18 },
  { name: 'Saudi Arabia', lat: 23.89, lng: 45.08 },
  { name: 'Singapore', lat: 1.35, lng: 103.82 },
  { name: 'South Korea', lat: 35.91, lng: 127.77 },
  { name: 'Sri Lanka', lat: 7.87, lng: 80.77 },
  { name: 'Syria', lat: 34.8, lng: 38.99 },
  { name: 'Taiwan', lat: 23.7, lng: 120.96 },
  { name: 'Tajikistan', lat: 38.86, lng: 71.28 },
  { name: 'Thailand', lat: 15.87, lng: 100.99 },
  { name: 'Timor-Leste', lat: -8.87, lng: 125.73 },
  { name: 'Turkey', lat: 38.96, lng: 35.24 },
  { name: 'Turkmenistan', lat: 38.97, lng: 59.56 },
  { name: 'United Arab Emirates', lat: 23.42, lng: 53.85 },
  { name: 'Uzbekistan', lat: 41.38, lng: 64.59 },
  { name: 'Vietnam', lat: 14.06, lng: 108.28 },
  { name: 'Yemen', lat: 15.55, lng: 48.52 },

  // AMERICAS
  { name: 'Antigua and Barbuda', lat: 17.06, lng: -61.8 },
  { name: 'Argentina', lat: -38.42, lng: -63.62 },
  { name: 'Bahamas', lat: 25.03, lng: -77.4 },
  { name: 'Barbados', lat: 13.19, lng: -59.54 },
  { name: 'Belize', lat: 17.19, lng: -88.5 },
  { name: 'Bolivia', lat: -16.29, lng: -63.59 },
  { name: 'Brazil', lat: -14.24, lng: -51.93 },
  { name: 'Canada', lat: 56.13, lng: -106.35 },
  { name: 'Chile', lat: -35.68, lng: -71.54 },
  { name: 'Colombia', lat: 4.57, lng: -74.3 },
  { name: 'Costa Rica', lat: 9.75, lng: -83.75 },
  { name: 'Cuba', lat: 21.52, lng: -77.78 },
  { name: 'Dominica', lat: 15.41, lng: -61.37 },
  { name: 'Dominican Republic', lat: 18.74, lng: -70.16 },
  { name: 'Ecuador', lat: -1.83, lng: -78.18 },
  { name: 'El Salvador', lat: 13.79, lng: -88.9 },
  { name: 'Grenada', lat: 12.12, lng: -61.68 },
  { name: 'Guatemala', lat: 15.78, lng: -90.23 },
  { name: 'Guyana', lat: 4.86, lng: -58.93 },
  { name: 'Haiti', lat: 18.97, lng: -72.29 },
  { name: 'Honduras', lat: 15.2, lng: -86.24 },
  { name: 'Jamaica', lat: 18.11, lng: -77.3 },
  { name: 'Mexico', lat: 23.63, lng: -102.55 },
  { name: 'Nicaragua', lat: 12.87, lng: -85.21 },
  { name: 'Panama', lat: 8.54, lng: -80.78 },
  { name: 'Paraguay', lat: -23.44, lng: -58.44 },
  { name: 'Peru', lat: -9.19, lng: -75.02 },
  { name: 'Saint Kitts and Nevis', lat: 17.36, lng: -62.78 },
  { name: 'Saint Lucia', lat: 13.91, lng: -60.98 },
  { name: 'Saint Vincent and the Grenadines', lat: 12.98, lng: -61.29 },
  { name: 'Suriname', lat: 3.92, lng: -56.03 },
  { name: 'Trinidad and Tobago', lat: 10.69, lng: -61.22 },
  { name: 'United States', lat: 37.09, lng: -95.71 },
  { name: 'Uruguay', lat: -32.52, lng: -55.77 },
  { name: 'Venezuela', lat: 6.42, lng: -66.59 },

  // OCEANIA
  { name: 'Australia', lat: -25.27, lng: 133.78 },
  { name: 'Fiji', lat: -17.71, lng: 178.07 },
  { name: 'Kiribati', lat: 1.87, lng: -157.36 },
  { name: 'Marshall Islands', lat: 7.13, lng: 171.18 },
  { name: 'Micronesia', lat: 7.43, lng: 150.55 },
  { name: 'Nauru', lat: -0.52, lng: 166.93 },
  { name: 'New Zealand', lat: -40.9, lng: 174.89 },
  { name: 'Palau', lat: 7.51, lng: 134.58 },
  { name: 'Papua New Guinea', lat: -6.31, lng: 143.96 },
  { name: 'Samoa', lat: -13.76, lng: -172.1 },
  { name: 'Solomon Islands', lat: -9.65, lng: 160.16 },
  { name: 'Tonga', lat: -21.18, lng: -175.2 },
  { name: 'Tuvalu', lat: -7.11, lng: 177.65 },
  { name: 'Vanuatu', lat: -15.38, lng: 166.96 },
];

// NÍVEL 0: sempre visíveis (zoom bem afastado)
const MAJOR_COUNTRIES = new Set<string>([
  'Russia', 'Canada', 'United States', 'China', 'Brazil', 'Australia', 'India',
  'Argentina', 'Kazakhstan', 'Algeria', 'Sudan', 'Libya', 'Mongolia', 'Iran',
  'Saudi Arabia', 'Peru', 'Indonesia', 'Mali', 'Niger', 'Chad', 'Angola', 'Egypt',
  'DR Congo', 'Mexico', 'South Africa', 'Nigeria', 'Tanzania', 'Colombia', 'Chile',
  'Bolivia', 'Venezuela', 'Turkey', 'Japan', 'Philippines', 'Papua New Guinea',
  'France', 'Germany', 'Spain', 'Italy', 'Norway', 'Sweden', 'United Kingdom',
  'Poland', 'Ukraine', 'Pakistan', 'Kenya', 'Malaysia',
]);

// NÍVEL 1: aparecem no zoom médio
const MEDIUM_COUNTRIES = new Set<string>([
  'Greece', 'Austria', 'Switzerland', 'Belgium', 'Netherlands', 'Portugal', 'Ireland',
  'Finland', 'Denmark', 'Czechia', 'Hungary', 'Romania', 'Bulgaria', 'Serbia', 'Croatia',
  'Iceland', 'Belarus', 'Israel', 'Iraq', 'Syria', 'Jordan', 'Lebanon', 'Kuwait', 'Qatar',
  'United Arab Emirates', 'Oman', 'Yemen', 'Thailand', 'Vietnam', 'South Korea',
  'North Korea', 'Myanmar', 'Bangladesh', 'Nepal', 'Afghanistan', 'Uzbekistan',
  'Turkmenistan', 'Ethiopia', 'Somalia', 'Morocco', 'Tunisia', 'Ghana', 'Cameroon',
  'Uganda', 'Zambia', 'Zimbabwe', 'Mozambique', 'Madagascar', 'New Zealand', 'Cuba',
  'Ecuador', 'Uruguay', 'Paraguay', 'Guatemala', 'Honduras', 'Nicaragua', 'Costa Rica',
  'Panama', 'Jamaica', 'Haiti', 'Dominican Republic', 'Sri Lanka', 'Taiwan', 'Singapore',
  'Cambodia', 'Laos', 'Georgia', 'Armenia', 'Azerbaijan', 'Greenland',
]);

// Zoom: altitude abaixo destes valores libera mais nomes
const LABEL_MID_ALT = 2.0; // abaixo disso: nível 0 + 1
const LABEL_NEAR_ALT = 1.2; // abaixo disso: todos

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
  // 0 = só grandes, 1 = grandes + médios, 2 = todos
  const [labelLevel, setLabelLevel] = useState<0 | 1 | 2>(0);

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

  // Lê a altitude do globo com frequência e troca o nível de nomes só quando muda
  useEffect(() => {
    const id = window.setInterval(() => {
      const pov = globeEl.current?.pointOfView?.();
      if (!pov || typeof pov.altitude !== 'number') return;
      const alt = pov.altitude;
      const level: 0 | 1 | 2 = alt < LABEL_NEAR_ALT ? 2 : alt < LABEL_MID_ALT ? 1 : 0;
      setLabelLevel((prev) => (prev === level ? prev : level));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const visibleLabels = useMemo(() => {
    if (labelLevel === 2) return WORLD_COUNTRIES;
    if (labelLevel === 1)
      return WORLD_COUNTRIES.filter((c) => MAJOR_COUNTRIES.has(c.name) || MEDIUM_COUNTRIES.has(c.name));
    return WORLD_COUNTRIES.filter((c) => MAJOR_COUNTRIES.has(c.name));
  }, [labelLevel]);

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
      {/* LOADER (show de 7 segundos) */}
      <Loader done={!isLoading} />

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
          labelsData={visibleLabels}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={isMobile ? 0.3 : 0.4}
          labelDotRadius={0}
          labelColor={() => 'rgba(241, 245, 249, 0.9)'}
          labelAltitude={0.01}
          labelResolution={2}
          pointsData={stations}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: any) => (favorites.includes(d.streamUrl) ? '#fbbf24' : '#22d3ee')}
          pointAltitude={0.02}
          pointRadius={(d: any) => (favorites.includes(d.streamUrl) ? 0.28 : 0.2)}
          pointsMerge={false}
          ringsData={stations}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: any) => (favorites.includes(d.streamUrl) ? '#fbbf24' : '#22d3ee')}
          ringMaxRadius={1.1}
          ringPropagationSpeed={0.9}
          ringRepeatPeriod={1400}
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
        <button
          className="player-reopen"
          onClick={() => setShowPlayer(true)}
          aria-label={t('reopenPlayer')}
        >
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