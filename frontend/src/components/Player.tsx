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
        setLocalTime(new Date().toLocaleTimeString('pt-BR', { timeZone: station.tz }));
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
      position: 'absolute', bottom: 20, right: 20, width: '280px',
      background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '12px', 
      color: '#e2e8f0', fontFamily: 'sans-serif', border: '1px solid rgba(6, 182, 212, 0.25)', 
      backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '1px', color: '#94a3b8' }}>CONEXÃO ATIVA</span>
        <span style={{ fontSize: '10px', color: isPlaying ? '#06b6d4' : '#f43f5e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: isPlaying ? '#06b6d4' : '#f43f5e', boxShadow: `0 0 5px ${isPlaying ? '#06b6d4' : '#f43f5e'}` }}></span>
          {isPlaying ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 600, color: '#f8fafc', letterSpacing: '0.5px' }}>
            {station.name}
          </h2>
          <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#94a3b8' }}>{station.city}, {station.country}</p>
        </div>
        <button 
          onClick={() => toggleFavorite(station.streamUrl)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', outline: 'none', color: isFav ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}
          title="Marcar como favorita"
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>
      
      <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px', letterSpacing: '0.5px' }}>HORA LOCAL DO TRANSMISSOR</div>
        <div style={{ fontSize: '24px', color: '#06b6d4', fontWeight: 300, letterSpacing: '1.5px', fontFamily: 'monospace' }}>
          {localTime}
        </div>
      </div>
      
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Frequência:</span> <span style={{ color: '#f8fafc', fontWeight: 500 }}>{station.genre}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Qualidade:</span> <span style={{ color: '#f8fafc', fontWeight: 500 }}>{station.bitrate}</span></div>
      </div>

      <button onClick={togglePlay} style={{ 
        background: isPlaying ? 'rgba(2, 6, 23, 0.6)' : '#06b6d4', 
        color: isPlaying ? '#06b6d4' : '#020617', 
        border: `1px solid ${isPlaying ? 'rgba(6, 182, 212, 0.5)' : '#06b6d4'}`, 
        padding: '10px 0', width: '100%', cursor: 'pointer', fontWeight: 600, fontSize: '11px', 
        borderRadius: '6px', letterSpacing: '1px', transition: 'all 0.2s', outline: 'none'
      }}>
        {isPlaying ? 'INTERROMPER ÁUDIO' : 'CONECTAR ÁUDIO'}
      </button>
    </div>
  );
}