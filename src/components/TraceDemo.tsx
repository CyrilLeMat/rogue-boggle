// Comment on trace : un doigt glisse d'une lettre à l'autre, en boucle.
const CELLS = [
  ['C', 'H', 'I'],
  ['A', 'T', 'R'],
  ['P', 'E', 'N'],
];
// C → H → A → T : le doigt passe par des cases voisines, sans repasser deux fois.
const PATH: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
const cx = (c: number) => 24 + c * 36;
const cy = (r: number) => 24 + r * 36;

export function TraceDemo() {
  const d = PATH.map(([r, c], i) => `${i ? 'L' : 'M'}${cx(c)} ${cy(r)}`).join(' ');
  return (
    <figure className="trace-demo">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        {CELLS.map((row, r) => row.map((letter, c) => (
          <g key={`${r}-${c}`}>
            <circle cx={cx(c)} cy={cy(r)} r="15" fill="#e9f1ea" stroke="#d6e2d8" strokeWidth="2" />
            <text x={cx(c)} y={cy(r) + 6} textAnchor="middle" fontFamily="'Nunito', sans-serif" fontSize="15" fontWeight="800" fill="#3f3a55">{letter}</text>
          </g>
        )))}
        <path className="trace-line" d={d} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
        <circle className="trace-finger" r="8" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5">
          <animateMotion dur="3.2s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.12;0.72;1" calcMode="linear" path={d} />
        </circle>
      </svg>
      <figcaption>Glisse d'une lettre à sa voisine, sans lever le doigt.</figcaption>
    </figure>
  );
}
