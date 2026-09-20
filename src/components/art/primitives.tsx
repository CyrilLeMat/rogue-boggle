// Trait commun à toutes les planches : aplats pastel, contour encre, personnages en fil de fer.
export const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' } as const;
export const SKIN = '#ffe1cf';

export const Desk = ({ x, y = 128, w = 60 }: { x: number; y?: number; w?: number }) => (
  <g stroke="#3f3a55" strokeWidth="2.5">
    <rect x={x} y={y} width={w} height="8" rx="2" fill="#c68a4e" />
    <path d={`M${x + 6} ${y + 8} v${180 - y - 8} M${x + w - 6} ${y + 8} v${180 - y - 8}`} />
  </g>
);

export const Kid = ({ x, y, skin = SKIN, arms = 'down' }: { x: number; y: number; skin?: string; arms?: 'down' | 'up' | 'side' }) => (
  <g>
    <circle cx={x} cy={y} r="11" fill={skin} stroke="#3f3a55" strokeWidth="2.5" />
    <path d={`M${x} ${y + 11} v22`} {...ink} />
    {arms === 'up' && <path d={`M${x} ${y + 17} l-13 -12 M${x} ${y + 17} l13 -12`} {...ink} />}
    {arms === 'down' && <path d={`M${x} ${y + 17} l-12 10 M${x} ${y + 17} l12 10`} {...ink} />}
    {arms === 'side' && <path d={`M${x} ${y + 17} h-14 M${x} ${y + 17} h14`} {...ink} />}
    <g fill="#3f3a55"><circle cx={x - 4} cy={y - 1} r="1.8" /><circle cx={x + 4} cy={y - 1} r="1.8" /></g>
  </g>
);

// Pluie et traits de tension : le vocabulaire des planches de transition.
export const Rain = ({ n = 22 }: { n?: number }) => (
  <g stroke="#8fb6d9" strokeWidth="2" strokeLinecap="round" opacity="0.75" className="rainfall">
    {Array.from({ length: n }, (_, i) => {
      const x = ((i * 137) % 320) + 4;
      const top = (i * 53) % 130;
      return <path key={i} d={`M${x} ${top} l-5 20`} />;
    })}
  </g>
);

export const Tension = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g stroke="#d9534f" strokeWidth="2.5" strokeLinecap="round" className="tension">
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
      return <path key={i} d={`M${x + Math.cos(a) * r} ${y + Math.sin(a) * r} l${Math.cos(a) * 8} ${Math.sin(a) * 8}`} />;
    })}
  </g>
);
