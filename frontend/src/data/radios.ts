import type { RadioStation } from '../types';

const FALLBACK_STATIONS: RadioStation[] = [
  { name: 'Rádio USP FM', country: 'Brasil', city: 'São Paulo', lat: -23.5505, lng: -46.6333, streamUrl: 'https://flow.emm.usp.br:8443/radiousp-128.mp3', genre: 'Educativa', bitrate: '128 kbps', listeners: 1450, tz: 'America/Sao_Paulo' },
  { name: 'Groove Salad', country: 'EUA', city: 'São Francisco', lat: 37.7749, lng: -122.4194, streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', genre: 'Ambient/Chill', bitrate: '128 kbps', listeners: 3200, tz: 'America/Los_Angeles' },
  { name: 'FIP Paris', country: 'França', city: 'Paris', lat: 48.8566, lng: 2.3522, streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3', genre: 'Eclectic', bitrate: '128 kbps', listeners: 8900, tz: 'Europe/Paris' },
  { name: '1LIVE', country: 'Alemanha', city: 'Colônia', lat: 50.9375, lng: 6.9603, streamUrl: 'https://wdr-1live-live.icecast.wdr.de/wdr/1live/live/mp3/128/stream.mp3', genre: 'Pop/Rock', bitrate: '128 kbps', listeners: 5600, tz: 'Europe/Berlin' },
  { name: 'LBC News', country: 'Reino Unido', city: 'Londres', lat: 51.5074, lng: -0.1278, streamUrl: 'https://media-ice.musicradio.com/LBCUKMP3', genre: 'News/Talk', bitrate: '128 kbps', listeners: 5500, tz: 'Europe/London' },
  { name: 'Listen.moe J-Pop', country: 'Japão', city: 'Tóquio', lat: 35.6762, lng: 139.6503, streamUrl: 'https://listen.moe/stream', genre: 'J-Pop', bitrate: '128 kbps', listeners: 12500, tz: 'Asia/Tokyo' }
];

export async function fetchGlobalStations(): Promise<RadioStation[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

    // Buscamos as estações mais populares do mundo sem travar no https estrito
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/topclick/2000', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();

    const apiStations = data
      .filter((station: any) => station.geo_lat && station.geo_long && station.url_resolved)
      .map((station: any) => {
        // Normaliza a URL: se começar com http, tenta garantir compatibilidade
        let streamUrl = station.url_resolved.trim();
        
        return {
          name: station.name ? station.name.trim() : 'Rádio Desconhecida',
          country: station.country ? station.country.trim() : 'Global',
          city: station.state ? station.state.trim() : (station.country ? station.country.trim() : 'Mundo'),
          lat: parseFloat(station.geo_lat),
          lng: parseFloat(station.geo_long),
          streamUrl: streamUrl,
          genre: station.tags ? station.tags.split(',')[0] : 'Geral',
          bitrate: station.bitrate ? `${station.bitrate} kbps` : '128 kbps',
          listeners: station.votes || Math.floor(Math.random() * 1000) + 100,
          tz: 'UTC'
        };
      });

    return apiStations.length > 0 ? apiStations : FALLBACK_STATIONS;
  } catch (error) {
    console.warn('API global indisponível, usando fallback local.');
    return FALLBACK_STATIONS;
  }
}