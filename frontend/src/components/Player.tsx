import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

interface PlayerProps {
  station: any;
  favorites: string[];
  toggleFavorite: (url: string) => void;
}

export default function Player({ station, favorites, toggleFavorite }: PlayerProps) {
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    if (!station) return;
    if (soundRef.current) soundRef.current.unload();

    soundRef.current = new Howl({
      src: [station.streamUrl],
      html5: true,
      format: ['mp3', 'aac', 'm3u8'],
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
    });
    
    soundRef.current.play();
    return () => { if (soundRef.current) soundRef.current.unload(); };
  }, [station]);

  useEffect(() => {
    if (!station?.tz) return;
    const updateTime = () => {
      try {
        setLocalTime(new Date().toLocaleTimeString('en-US', { timeZone: station.tz }));
      } catch (e) { setLocalTime('N/A'); }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [station]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    isPlaying ? soundRef.current.pause() : soundRef.current.play();
  };

  if (!station) return null;
  const isFav = favorites.includes(station.streamUrl);

  return (
    <div style={{ 
      width: '100%', 
      background: 'rgba(15, 23, 42, 0.85)', padding: '8px 10px', borderRadius: '8px', 
      color: '#e2e8f0', fontFamily: 'sans-serif', border: '1px solid rgba(6, 182, 212, 0.25)', 
      backdropFilter: 'blur(16px)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      boxSizing: 'border-box'
    }}>
      {/* Cabeçalho de Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '6px' }}>
        <span style={{ fontSize: '8px', letterSpacing: '0.5px', color: '#94a3b8' }}>ACTIVE CONNECTION</span>
        <span style={{ fontSize: '8px', color: isPlaying ? '#06b6d4' : '#f43f5e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: isPlaying ? '#06b6d4' : '#f43f5e', boxShadow: `0 0 4px ${isPlaying ? '#06b6d4' : '#f43f5e'}` }}></span>
          {isPlaying ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      
      {/* Nome da Rádio e Favorito */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ overflow: 'hidden', paddingRight: '4px' }}>
          <h2 style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {station.name}
          </h2>
          <p style={{ margin: 0, fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{station.city}, {station.country}</p>
        </div>
        <button 
          onClick={() => toggleFavorite(station.streamUrl)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0, color: isFav ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}
          title="Mark as favorite"
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>
      
      {/* Relógio Compacto */}
      <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '3px 6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '8px', color: '#94a3b8' }}>TIME</span>
        <span style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 400, fontFamily: 'monospace' }}>
          {localTime}
        </span>
      </div>
      
      {/* Detalhes Técnicos */}
      <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <span>{station.genre}</span>
        <span style={{ color: '#f8fafc' }}>{station.bitrate}</span>
      </div>

      {/* Botão de Play/Stop */}
      <button onClick={togglePlay} style={{ 
        background: isPlaying ? 'rgba(2, 6, 23, 0.6)' : '#06b6d4', 
        color: isPlaying ? '#06b6d4' : '#020617', 
        border: `1px solid ${isPlaying ? 'rgba(6, 182, 212, 0.5)' : '#06b6d4'}`, 
        padding: '4px 0', width: '100%', cursor: 'pointer', fontWeight: 600, fontSize: '9px', 
        borderRadius: '4px', letterSpacing: '0.5px', transition: 'all 0.2s', outline: 'none'
      }}>
        {isPlaying ? 'STOP AUDIO' : 'CONNECT AUDIO'}
      </button>
    </div>
  );
}