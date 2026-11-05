import { useState } from 'react';
import type { RadioStation } from '../types';
import { useI18n } from '../i18n';

interface SidebarProps {
  isOpen: boolean;
  stations: RadioStation[];
  favorites: string[];
  toggleFavorite: (url: string) => void;
  onSelectStation: (s: RadioStation) => void;
  onClose: () => void;
}

const FAV_KEY = '__favorites__';

export default function Sidebar({
  isOpen,
  stations,
  favorites,
  toggleFavorite,
  onSelectStation,
  onClose,
}: SidebarProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? stations.filter((s) => `${s.name} ${s.city} ${s.country}`.toLowerCase().includes(q))
    : stations;

  const groups: Record<string, RadioStation[]> = {};
  for (const s of filtered) {
    if (!groups[s.country]) groups[s.country] = [];
    groups[s.country].push(s);
  }

  const countries = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  const favs = filtered.filter((s) => favorites.includes(s.streamUrl));
  if (favs.length) groups[FAV_KEY] = favs;
  const keys = favs.length ? [FAV_KEY, ...countries] : countries;

  const isExpanded = (key: string) => (q ? true : expanded === key);
  const toggle = (key: string) => setExpanded((e) => (e === key ? null : key));

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="sidebar-head">
        <div className="sidebar-title-row">
          <div>
            <h2>{t('globalDirectory')}</h2>
            <p className="sidebar-sub">
              {stations.length} {t('stationsLive')}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t('closeDirectory')}>
            ✕
          </button>
        </div>

        <input
          className="search"
          type="search"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-body">
        {keys.length === 0 && <p className="empty">{t('noStations')}</p>}

        {keys.map((key) => {
          const list = groups[key];
          const open = isExpanded(key);
          const isFavGroup = key === FAV_KEY;

          return (
            <div className="country" key={key}>
              <button
                className={`country-btn${open ? ' is-open' : ''}`}
                onClick={() => toggle(key)}
                aria-expanded={open}
              >
                <span className={`label${isFavGroup ? ' fav-label' : ''}`}>
                  {isFavGroup ? t('favorites') : key.toUpperCase()}
                </span>
                <span className="count-pill">
                  {open ? '▾' : '▸'} {list.length}
                </span>
              </button>

              {open && (
                <ul className="station-list">
                  {[...list]
                    .sort((a, b) => a.city.localeCompare(b.city))
                    .map((radio, idx) => {
                      const isFav = favorites.includes(radio.streamUrl);
                      return (
                        <li key={`${radio.streamUrl}-${idx}`}>
                          <div
                            className="station-item"
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectStation(radio)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectStation(radio);
                              }
                            }}
                          >
                            <div className="station-row">
                              <span className="station-city">{radio.city}</span>
                              <button
                                className={`star-btn${isFav ? ' on' : ''}`}
                                aria-label={isFav ? t('removeFavorite') : t('addFavorite')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(radio.streamUrl);
                                }}
                              >
                                {isFav ? '★' : '☆'}
                              </button>
                            </div>
                            <span className="station-name">{radio.name}</span>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}