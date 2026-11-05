import { useCallback, useEffect, useState } from 'react';

export type Lang = 'en' | 'pt';

const STORAGE_KEY = 'gps_lang';
const EVENT = 'radiomoa-lang-change';

const dict = {
  en: {
    loading: 'Loading... GPS',
    directory: 'Directory',
    hide: 'Hide',
    stations: 'stations',
    stationsLive: 'stations live',
    language: 'Language',
    globalDirectory: 'GLOBAL DIRECTORY',
    closeDirectory: 'Close directory',
    searchPlaceholder: 'Search station, city or country',
    noStations: 'No stations found.',
    favorites: '★ Favorites',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    supportProject: 'Support project',
    studyMaterials: 'Study materials',
    techTitle: 'Technology & Innovation',
    copyKey: 'Copy key',
    copied: 'Copied ✓',
    qrAlt: 'Pix QR Code',
    live: 'LIVE',
    offline: 'OFFLINE',
    signalError: 'SIGNAL ERROR',
    play: 'Play',
    stop: 'Stop',
    retry: 'Try again',
    closePlayer: 'Close player',
    minimizePlayer: 'Minimize player',
    expandPlayer: 'Expand player',
    reopenPlayer: 'Reopen player',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
  },
  pt: {
    loading: 'Carregando... GPS',
    directory: 'Diretório',
    hide: 'Ocultar',
    stations: 'rádios',
    stationsLive: 'estações ao vivo',
    language: 'Idioma',
    globalDirectory: 'DIRETÓRIO GLOBAL',
    closeDirectory: 'Fechar diretório',
    searchPlaceholder: 'Buscar rádio, cidade ou país',
    noStations: 'Nenhuma estação encontrada.',
    favorites: '★ Favoritos',
    addFavorite: 'Adicionar aos favoritos',
    removeFavorite: 'Remover dos favoritos',
    supportProject: 'Apoiar projeto',
    studyMaterials: 'Material de apoio',
    techTitle: 'Tecnologia & Inovação',
    copyKey: 'Copiar chave',
    copied: 'Copiado ✓',
    qrAlt: 'QR Code Pix',
    live: 'AO VIVO',
    offline: 'OFFLINE',
    signalError: 'ERRO DE SINAL',
    play: 'Tocar',
    stop: 'Parar',
    retry: 'Tentar novamente',
    closePlayer: 'Fechar player',
    minimizePlayer: 'Minimizar player',
    expandPlayer: 'Expandir player',
    reopenPlayer: 'Reabrir player',
    zoomIn: 'Aproximar',
    zoomOut: 'Afastar',
  },
} as const;

export type TKey = keyof typeof dict.en;

function readLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'pt' ? 'pt' : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Idioma padrão: inglês. Só vira 'pt' se a pessoa escolher PT.
 * Todos os componentes que usam o hook ficam sincronizados.
 */
export function useI18n() {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    const sync = () => setLangState(readLang());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* sem localStorage: só troca na sessão atual */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const t = useCallback((key: TKey) => dict[lang][key], [lang]);
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';

  return { lang, setLang, t, locale };
}