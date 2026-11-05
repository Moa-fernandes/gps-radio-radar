import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useI18n } from '../i18n';

interface PlayerProps {
  station: any;
  active: boolean;
  favorites: string[];
  toggleFavorite: (url: string) => void;
  onClose: () => void;
}

export default function Player({ station, active, favorites, toggleFavorite, onClose }: PlayerProps) {
  const { t, locale } = useI18n();
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    if (!active || !station) {
      setIsPlaying(false);
      return;
    }

    setHasError(false);

    const sound = new Howl({
      src: [station.streamUrl],
      html5: true,
      format: ['mp3', 'aac', 'm3u8'],
      onplay: () => {
        setIsPlaying(true);
        setHasError(false);
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
      onloaderror: () => {
        setIsPlaying(false);
        setHasError(true);
      },
      onplayerror: () => {
        setIsPlaying(false);
        setHasError(true);
      },
    });

    soundRef.current = sound;
    sound.play();

    return () => {
      sound.unload();
      if (soundRef.current === sound) soundRef.current = null;
    };
  }, [station, active, retryKey]);

  useEffect(() => {
    if (!station?.tz) return;
    const tick = () => {
      try {
        setLocalTime(new Date().toLocaleTimeString(locale, { timeZone: station.tz }));
      } catch {
        setLocalTime('--:--:--');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [station, locale]);

  const togglePlay = () => {
    if (hasError) {
      setRetryKey((k) => k + 1);
      return;
    }
    const sound = soundRef.current;
    if (!sound) return;
    if (isPlaying) sound.stop();
    else sound.play();
  };

  const isFav = favorites.includes(station.streamUrl);
  const statusLabel = hasError ? t('signalError') : isPlaying ? t('live') : t('offline');
  const btnLabel = hasError ? t('retry') : isPlaying ? t('stop') : t('play');

  return (
    <div className={`player${minimized ? ' is-min' : ''}`}>
      <div className="player-head">
        <div className="player-status">
          <span className={`live-dot${isPlaying ? ' on' : ''}${hasError ? ' err' : ''}`} />
          <span>{statusLabel}</span>
        </div>

        <div className="player-actions">
          <button
            className={`icon-btn fav${isFav ? ' on' : ''}`}
            onClick={() => toggleFavorite(station.streamUrl)}
            aria-label={isFav ? t('removeFavorite') : t('addFavorite')}
          >
            {isFav ? '★' : '☆'}
          </button>
          <button
            className="icon-btn"
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? t('expandPlayer') : t('minimizePlayer')}
          >
            {minimized ? '▴' : '▾'}
          </button>
          <button className="icon-btn" onClick={onClose} aria-label={t('closePlayer')}>
            ✕
          </button>
        </div>
      </div>

      <div className="player-main">
        <div className="player-title">
          <h2>{station.name}</h2>
          <p>
            {station.city}, {station.country}
          </p>
        </div>

        <button
          className={`play-btn${isPlaying ? ' is-playing' : ''}${hasError ? ' is-error' : ''}`}
          onClick={togglePlay}
          aria-label={btnLabel}
          title={btnLabel}
        >
          {hasError ? '↻' : isPlaying ? '■' : '▶'}
        </button>
      </div>

      {!minimized && (
        <div className="player-meta">
          <span className="genre">{station.genre}</span>
          <span className="time">{localTime}</span>
          <span className="bitrate">{station.bitrate}</span>
        </div>
      )}
    </div>
  );
}