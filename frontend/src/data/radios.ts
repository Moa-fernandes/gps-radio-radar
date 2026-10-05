import tzlookup from 'tz-lookup';
import type { RadioStation } from '../types';

const FALLBACK_STATIONS: RadioStation[] = [
  { name: 'Rádio USP FM', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333, streamUrl: 'https://flow.emm.usp.br:8443/radiousp-128.mp3', genre: 'Educational', bitrate: '128 kbps', listeners: 1450, tz: 'America/Sao_Paulo' },
  { name: 'Groove Salad', country: 'USA', city: 'San Francisco', lat: 37.7749, lng: -122.4194, streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', genre: 'Ambient/Chill', bitrate: '128 kbps', listeners: 3200, tz: 'America/Los_Angeles' },
  { name: 'FIP Paris', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522, streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3', genre: 'Eclectic', bitrate: '128 kbps', listeners: 8900, tz: 'Europe/Paris' },
  { name: '1LIVE', country: 'Germany', city: 'Cologne', lat: 50.9375, lng: 6.9603, streamUrl: 'https://wdr-1live-live.icecast.wdr.de/wdr/1live/live/mp3/128/stream.mp3', genre: 'Pop/Rock', bitrate: '128 kbps', listeners: 5600, tz: 'Europe/Berlin' },
  { name: 'LBC News', country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278, streamUrl: 'https://media-ice.musicradio.com/LBCUKMP3', genre: 'News/Talk', bitrate: '128 kbps', listeners: 5500, tz: 'Europe/London' },
  { name: 'Listen.moe J-Pop', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503, streamUrl: 'https://listen.moe/stream', genre: 'J-Pop', bitrate: '128 kbps', listeners: 12500, tz: 'Asia/Tokyo' }
];

export async function fetchGlobalStations(): Promise<RadioStation[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

    // Buscamos as estações mais populares do mundo sem travar no https estrito
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/topclick/2000', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();

    const apiStations = data
      .filter((station: any) => station.geo_lat && station.geo_long && station.url_resolved)
      .map((station: any) => {
        let streamUrl = station.url_resolved.trim();
        
        let lat = parseFloat(station.geo_lat);
        let lng = parseFloat(station.geo_long);
        let timeZone = 'UTC';
        
        // Converte a Latitude e Longitude para o Fuso Horário local (ex: Europe/Lisbon)
        try {
          if (!isNaN(lat) && !isNaN(lng)) {
            timeZone = tzlookup(lat, lng);
          }
        } catch (e) {
          timeZone = 'UTC'; // Fallback de segurança caso as coordenadas no oceano falhem
        }
        
        return {
          name: station.name ? station.name.trim() : 'Unknown Radio',
          country: station.country ? station.country.trim() : 'Global',
          city: station.state ? station.state.trim() : (station.country ? station.country.trim() : 'World'),
          lat: lat,
          lng: lng,
          streamUrl: streamUrl,
          genre: station.tags ? station.tags.split(',')[0] : 'General',
          bitrate: station.bitrate ? `${station.bitrate} kbps` : '128 kbps',
          listeners: station.votes || Math.floor(Math.random() * 1000) + 100,
          tz: timeZone
        };
      });

    return apiStations.length > 0 ? apiStations : FALLBACK_STATIONS;
  } catch (error) {
    console.warn('Global API unavailable, using local fallback.');
    return FALLBACK_STATIONS;
  }
}