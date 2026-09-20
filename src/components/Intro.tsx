import { useEffect, useState } from 'react';
import { setMusicMood } from '../audio/music';
import { useRunStore } from '../state/runStore';
import { useSay } from '../theme/useSay';

// Prologue en trois cases de bande dessinée. Le ton du jeu tient là-dedans :
// une tragédie antique pour une dictée de CE2, avec un fond de révolte.

const PANELS = [
  {
    title: 'I. La récré',
    text: [
      'Il était une fois une récréation parfaite.',
      'Le soleil chauffait les billes, le goudron sentait l\'été, on aurait pu faire {cour} pendant mille ans.',
      'Puis la cloche sonna. Et avec elle s\'acheva l\'âge d\'or.',
    ],
    art: <Recre />,
  },
  {
    title: 'II. L\'annonce',
    text: [
      'La maîtresse se retourna. Six lettres à la craie. Un accent aigu, tranchant comme une lame.',
      'Dictée.',
      'Vingt-six cœurs de CE2 cessèrent de battre. Le tien, lui, se souvint d\'une loi qu\'aucun règlement n\'a jamais écrite : on ne cède pas.',
    ],
    art: <Annonce />,
  },
  {
    title: 'III. La révolte',
    text: [
      'Tes genoux tremblent ? Qu\'ils tremblent. La sueur coule ? Qu\'elle coule.',
      'Tu montes sur la table. Et à la face du Bescherelle, de la maîtresse et de toute la République, tu hurles :',
    ],
    cry: '« Dictée, tu ne m\'auras pas ! »',
    art: <Revolte />,
  },
];

function Recre() {
  return (
    <svg viewBox="0 0 320 200" className="panel-art">
      <rect width="320" height="200" fill="#fff4dc" />
      <circle cx="262" cy="42" r="26" fill="#f7c55c" />
      <circle cx="262" cy="42" r="34" fill="none" stroke="#f7c55c" strokeWidth="3" strokeDasharray="6 10" />
      <rect y="132" width="320" height="68" fill="#b9b3ad" />
      <path d="M0 132 h320" stroke="#8d867f" strokeWidth="2" />
      <ellipse cx="120" cy="188" rx="40" ry="5" fill="#a39c95" />
      {/* marelle */}
      <g stroke="#f6f1e4" strokeWidth="2" fill="none">
        <rect x="20" y="150" width="26" height="16" /><rect x="46" y="150" width="26" height="16" /><rect x="20" y="166" width="26" height="16" /><rect x="46" y="166" width="26" height="16" />
      </g>
      {/* deux enfants */}
      <g stroke="#3f3a55" strokeWidth="3" strokeLinecap="round" fill="none">
        <circle cx="120" cy="104" r="12" fill="#ffe1cf" />
        <path d="M120 116 v34 M120 124 l-16 12 M120 124 l16 -8 M120 150 l-10 18 M120 150 l10 18" />
        <circle cx="200" cy="100" r="12" fill="#f6d1c2" />
        <path d="M200 112 v36 M200 120 l14 14 M200 120 l-14 -10 M200 148 l-12 18 M200 148 l12 18" />
      </g>
      <path d="M96 84 q10 -14 20 0" stroke="#f28b7d" strokeWidth="3" fill="none" />
      {/* billes */}
      <circle cx="150" cy="176" r="4" fill="#7d6bc4" /><circle cx="160" cy="180" r="4" fill="#5fae83" /><circle cx="143" cy="184" r="4" fill="#f28b7d" />
      {/* la cloche */}
      <g className="bell">
        <path d="M290 96 q0 -22 14 -26 q14 4 14 26 l6 8 h-40 z" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2" />
        <circle cx="304" cy="108" r="3" fill="#3f3a55" />
      </g>
      <text x="252" y="86" fontFamily="'Patrick Hand', cursive" fontSize="16" fill="#3f3a55" className="ring">DRIIING</text>
    </svg>
  );
}

function Annonce() {
  return (
    <svg viewBox="0 0 320 200" className="panel-art">
      <rect width="320" height="200" fill="#e9e3f4" />
      <rect x="40" y="18" width="240" height="96" rx="4" fill="#2f5d4b" stroke="#8a5a2b" strokeWidth="6" />
      <text x="160" y="80" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="46" fill="#f6f1e4" className="chalk">DICTÉE</text>
      <path d="M232 24 l-8 18 h10 l-14 24 l5 -18 h-10 z" fill="#f4d35e" className="bolt" />
      {/* la maîtresse, de dos, bras levé vers le tableau */}
      <g stroke="#3f3a55" strokeWidth="3" strokeLinecap="round" fill="none">
        <circle cx="270" cy="96" r="11" fill="#3f3a55" />
        <path d="M270 107 v44 M270 118 l-14 -26 M270 118 l12 14" />
        <path d="M256 151 h28 l-4 30 h-20 z" fill="#7d6bc4" stroke="none" />
      </g>
      {/* rangées de têtes */}
      <g fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2">
        <circle cx="60" cy="150" r="9" /><circle cx="100" cy="152" r="9" /><circle cx="140" cy="150" r="9" /><circle cx="180" cy="152" r="9" /><circle cx="220" cy="150" r="9" />
      </g>
      <g fill="#3f3a55">
        <circle cx="57" cy="149" r="1.6" /><circle cx="63" cy="149" r="1.6" /><circle cx="97" cy="151" r="1.6" /><circle cx="103" cy="151" r="1.6" /><circle cx="177" cy="151" r="1.6" /><circle cx="183" cy="151" r="1.6" /><circle cx="217" cy="149" r="1.6" /><circle cx="223" cy="149" r="1.6" />
      </g>
      {/* toi : yeux écarquillés, gouttes */}
      <circle cx="140" cy="150" r="11" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      <circle cx="136" cy="149" r="3.2" fill="#fff" stroke="#3f3a55" strokeWidth="1.5" /><circle cx="144" cy="149" r="3.2" fill="#fff" stroke="#3f3a55" strokeWidth="1.5" />
      <circle cx="136" cy="149" r="1.3" fill="#3f3a55" /><circle cx="144" cy="149" r="1.3" fill="#3f3a55" />
      <path d="M137 156 q3 -2 6 0" stroke="#3f3a55" strokeWidth="1.5" fill="none" />
      <path d="M152 140 q3 6 0 8 q-3 -2 0 -8 z" fill="#7fb0e0" className="drop" /><path d="M126 138 q3 6 0 8 q-3 -2 0 -8 z" fill="#7fb0e0" className="drop" />
      <rect y="166" width="320" height="34" fill="#c9bfa8" />
    </svg>
  );
}

function Revolte() {
  return (
    <svg viewBox="0 0 320 200" className="panel-art">
      <rect width="320" height="200" fill="#3f3a55" />
      {/* rayons */}
      <g stroke="#f28b7d" strokeWidth="2" opacity="0.55" className="rays">
        {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <path key={i} d={`M160 100 L${160 + Math.cos(a) * 240} ${100 + Math.sin(a) * 240}`} />; })}
      </g>
      {/* la table */}
      <rect x="104" y="140" width="112" height="12" rx="2" fill="#b98652" stroke="#1f1b2e" strokeWidth="2" />
      <rect x="112" y="152" width="8" height="40" fill="#8a5a2b" /><rect x="200" y="152" width="8" height="40" fill="#8a5a2b" />
      {/* chaise renversée */}
      <g transform="rotate(-70 60 180)" stroke="#1f1b2e" strokeWidth="2"><rect x="46" y="160" width="28" height="6" fill="#b98652" /><rect x="48" y="166" width="4" height="22" fill="#8a5a2b" /><rect x="68" y="166" width="4" height="22" fill="#8a5a2b" /></g>
      {/* toi, debout, poing levé, cheveux dressés */}
      <g stroke="#f6f1e4" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M160 72 v42 M160 84 l-22 18 M160 84 l20 -34 M160 114 l-12 26 M160 114 l12 26" />
      </g>
      <circle cx="160" cy="60" r="13" fill="#ffe1cf" stroke="#f6f1e4" strokeWidth="3" />
      <path d="M150 50 l-4 -10 M156 47 l-1 -11 M164 47 l2 -11 M170 50 l5 -9" stroke="#f6f1e4" strokeWidth="3" strokeLinecap="round" />
      <circle cx="180" cy="48" r="7" fill="#ffe1cf" stroke="#f6f1e4" strokeWidth="3" className="fist" />
      {/* sourcils baissés, mâchoire serrée, veine sur la tempe : il est furieux */}
      <path d="M152 55 l8 4 M168 55 l-8 4" stroke="#3f3a55" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M153 66 q7 -6 14 0 q-7 5 -14 0z" fill="#3f3a55" />
      <path d="M154 68 h12" stroke="#fffdf9" strokeWidth="1.2" />
      <g stroke="#d9534f" strokeWidth="2" strokeLinecap="round" className="tension">
        <path d="M140 42 l-5 -4 M140 42 l-5 4 M140 42 h-6" />
      </g>
      {/* le tag */}
      <text x="160" y="186" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="22" fill="#f28b7d" transform="rotate(-4 160 186)" className="tag">PAS AUJOURD'HUI</text>
      {/* étoiles */}
      <g fill="#f4d35e" className="stars"><path d="M40 40 l4 10 10 1 -8 7 3 10 -9 -6 -9 6 3 -10 -8 -7 10 -1z" /><path d="M276 30 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" /></g>
    </svg>
  );
}

// La récré est encore insouciante, l'annonce serre la gorge, la révolte part au combat.
const PANEL_MOODS = ['classe', 'choc', 'combat'] as const;

export function Intro() {
  const accept = useRunStore((s) => s.acceptChallenge);
  const [i, setI] = useState(0);
  const say = useSay();
  useEffect(() => { setMusicMood(PANEL_MOODS[i]); }, [i]);
  const panel = PANELS[i];
  const last = i === PANELS.length - 1;
  const next = () => (last ? accept() : setI(i + 1));
  return (
    <div className="panel intro" onClick={next}>
      <div className="strip">
        {PANELS.map((p, idx) => (
          <div key={p.title} className={`frame ${idx === i ? 'current' : idx < i ? 'seen' : 'later'}`} style={{ rotate: `${(idx - 1) * 1.6}deg` }}>
            {idx <= i ? p.art : <div className="panel-art blank">?</div>}
            <span className="frame-title">{p.title}</span>
          </div>
        ))}
      </div>
      <div className="intro-text" key={i}>
        {panel.text.map((l, k) => <p key={k} style={{ animationDelay: `${0.15 + k * 0.7}s` }}>{say(l)}</p>)}
        {'cry' in panel && panel.cry && <p className="intro-cry" style={{ animationDelay: `${0.3 + panel.text.length * 0.7}s` }}>{say(panel.cry)}</p>}
      </div>
      <div className="dots">{PANELS.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
      <button className="intro-cta" onClick={(e) => { e.stopPropagation(); next(); }}>{last ? 'Monter sur la table' : 'Suite →'}</button>
      <button className="intro-skip" onClick={(e) => { e.stopPropagation(); accept(); }}>passer le prologue</button>
    </div>
  );
}
