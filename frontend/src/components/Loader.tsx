import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useI18n } from '../i18n';

interface LoaderProps {
  done: boolean;
}

const TITLE = 'World Radio in 3D';
const DURATION_MS = 7000;
const EXIT_MS = 800;
const PHRASE_MS = 2333;

// Código Morse
const MORSE: Record<string, string> = {
  R: '.-.',
  A: '.-',
  D: '-..',
  I: '..',
  O: '---',
  M: '--',
};

type MorseItem = { kind: 'dot' | 'dash' | 'gap'; delay: number };

function buildMorse(word: string): MorseItem[] {
  const items: MorseItem[] = [];
  let at = 1.4;
  for (const ch of word) {
    const code = MORSE[ch];
    if (!code) continue;
    for (const s of code) {
      const kind = s === '.' ? 'dot' : 'dash';
      items.push({ kind, delay: at });
      at += (kind === 'dot' ? 0.1 : 0.22) + 0.08;
    }
    items.push({ kind: 'gap', delay: at });
    at += 0.18;
  }
  return items;
}

const MORSE_ITEMS = buildMorse(TITLE);

// Grade do globo em viewBox 0–100
const C = 50;
const R = 45;
const GRID: string[] = [
  `M 5 ${C} A ${R} ${R} 0 1 0 95 ${C} A ${R} ${R} 0 1 0 5 ${C}`, // contorno
  `M ${C} 5 L ${C} 95`, // meridiano central
  ...[11, 22, 34].map(
    (k) => `M ${C - k} ${C} A ${k} ${R} 0 1 0 ${C + k} ${C} A ${k} ${R} 0 1 0 ${C - k} ${C}`
  ), // meridianos
  ...[-30, -15, 15, 30].map((o) => {
    const w = Math.sqrt(R * R - o * o);
    return `M ${C - w} ${C + o} L ${C + w} ${C + o}`;
  }), // paralelos
  `M 5 ${C} L 95 ${C}`, // equador
];

const TICKS = Array.from({ length: 21 }, (_, i) => i);
const EQ_BARS = Array.from({ length: 18 }, (_, i) => ({
  d: 0.6 + ((i * 37) % 7) / 10,
  delay: ((i * 53) % 6) / 10,
}));

export default function Loader({ done }: LoaderProps) {
  const { t } = useI18n();
  const [timeUp, setTimeUp] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [phase, setPhase] = useState(0);

  const phrases = [t('loadStep1'), t('loadStep2'), t('loadStep3')];

  const blips = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 16 + Math.random() * 32;
        return {
          id: i,
          x: 50 + Math.cos(angle) * dist,
          y: 50 + Math.sin(angle) * dist,
          delay: Math.random() * 3.2,
        };
      }),
    []
  );

  // Cronômetro de 7 segundos e troca de frases
  useEffect(() => {
    const timer = window.setTimeout(() => setTimeUp(true), DURATION_MS);
    const ticker = window.setInterval(() => setPhase((p) => p + 1), PHRASE_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(ticker);
    };
  }, []);

  // Só sai quando o tempo acabou e os dados chegaram
  useEffect(() => {
    if (!timeUp || !done) return;
    setExiting(true);
    const id = window.setTimeout(() => setRemoved(true), EXIT_MS);
    return () => clearTimeout(id);
  }, [timeUp, done]);

  if (removed) return null;

  return (
    <div className={`loader${exiting ? ' is-exit' : ''}`} role="status" aria-live="polite">
      {/* RADAR + GLOBO DESENHANDO */}
      <div className="radar" aria-hidden="true">
        <svg className="globe-grid" viewBox="0 0 100 100">
          {GRID.map((d, i) => (
            <path key={i} d={d} pathLength={1} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </svg>
        <span className="radar-sweep" />
        {blips.map((b) => (
          <span
            key={b.id}
            className="radar-blip"
            style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${b.delay}s` }}
          />
        ))}
        <span className="radar-ripple a" />
        <span className="radar-ripple b" />
        <span className="radar-ripple c" />
        <span className="radar-core" />
      </div>

      <p className="loader-kicker">{t('welcome')}</p>

      <h1 className="loader-title">
        {TITLE.split('').map((ch, i) => (
          <span key={i} style={{ animationDelay: `${0.2 + i * 0.07}s` }}>
            {ch}
          </span>
        ))}
      </h1>

      {/* EQUALIZADOR */}
      <div className="eq" aria-hidden="true">
        {EQ_BARS.map((b, i) => (
          <span
            key={i}
            style={{ '--d': `${b.d}s`, '--delay': `${b.delay}s` } as CSSProperties}
          />
        ))}
      </div>

      <p className="loader-phrase" key={phase}>
        {phrases[phase % phrases.length]}
      </p>

      {/* DIAL DE FREQUÊNCIA */}
      <div className="dial" aria-hidden="true">
        <div className="dial-ticks">
          {TICKS.map((i) => (
            <i key={i} className={i % 4 === 0 ? 'major' : undefined} />
          ))}
        </div>
        <span className="dial-needle" />
        <div className="dial-readout">
          <span className="dial-lamp" />
          <span className="dial-label">{t('locked')}</span>
          <span className="dial-mhz">88–108 MHz</span>
        </div>
      </div>

      {/* CÓDIGO MORSE */}
      <div className="morse" aria-hidden="true">
        {MORSE_ITEMS.map((m, i) =>
          m.kind === 'gap' ? (
            <span key={i} className="morse-gap" />
          ) : (
            <span
              key={i}
              className={`sym ${m.kind}`}
              style={{ '--d': `${m.delay}s` } as CSSProperties}
            />
          )
        )}
      </div>
    </div>
  );
}