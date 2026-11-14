// The homepage's whiteboard: the event loop, drawn the way you would draw it in an interview.
// Strokes draw in once on load (see .sketch in globals.css); colours are the site's marker tokens,
// so it becomes a chalkboard in dark mode. Decorative for layout, but described for screen readers.
import type { CSSProperties } from 'react';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

export default function WhiteboardSketch() {
  const stroke = { fill: 'none', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg
      viewBox="0 0 560 430"
      className="sketch w-full h-auto"
      role="img"
      aria-label="Whiteboard sketch of the JavaScript event loop: a call stack, a microtask queue that is drained completely, and a task queue from which one task is taken per turn."
    >
      <defs>
        <filter id="wobble" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
        <marker id="wb-arrow-blue" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="var(--marker)" strokeWidth="1.6" strokeLinecap="round" />
        </marker>
        <marker id="wb-arrow-red" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="var(--red-marker)" strokeWidth="1.6" strokeLinecap="round" />
        </marker>
        <marker id="wb-arrow-ink" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
        </marker>
      </defs>

      {/* the board */}
      <rect x="4" y="4" width="552" height="378" rx="14" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />

      <g filter="url(#wobble)">
        {/* title underline */}
        <path className="draw" style={step(0)} pathLength={1} d="M30 58 C 70 52, 120 62, 176 55" stroke="var(--marker)" {...stroke} />

        {/* call stack */}
        <path className="draw" style={step(1)} pathLength={1} d="M30 92 L30 318 L176 318 L176 92" stroke="var(--ink)" {...stroke} />
        <path className="draw" style={step(2)} pathLength={1} d="M42 306 L164 306 L164 270 L42 270 Z" stroke="var(--ink)" {...stroke} />
        <path className="draw" style={step(3)} pathLength={1} d="M42 262 L164 262 L164 226 L42 226 Z" stroke="var(--ink)" {...stroke} />

        {/* microtask queue */}
        <path className="draw" style={step(4)} pathLength={1} d="M336 92 L530 92 L530 172 L336 172 Z" stroke="var(--marker)" {...stroke} />
        <path className="draw" style={step(5)} pathLength={1} d="M348 128 L424 128 L424 160 L348 160 Z" stroke="var(--marker)" {...stroke} />
        <path className="draw" style={step(5)} pathLength={1} d="M436 128 L518 128 L518 160 L436 160 Z" stroke="var(--marker)" {...stroke} />

        {/* task queue */}
        <path className="draw" style={step(6)} pathLength={1} d="M336 228 L530 228 L530 308 L336 308 Z" stroke="var(--red-marker)" {...stroke} />
        <path className="draw" style={step(7)} pathLength={1} d="M348 264 L424 264 L424 296 L348 296 Z" stroke="var(--red-marker)" {...stroke} />
        <path className="draw" style={step(7)} pathLength={1} d="M436 264 L518 264 L518 296 L436 296 Z" stroke="var(--red-marker)" {...stroke} />

        {/* the loop */}
        <path className="draw" style={step(8)} pathLength={1} d="M286 200 A 30 30 0 1 1 256 170" stroke="var(--ink)" markerEnd="url(#wb-arrow-ink)" {...stroke} />

        {/* queues feed the stack */}
        <path className="draw" style={step(9)} pathLength={1} d="M332 132 C 280 120, 236 150, 184 200" stroke="var(--marker)" markerEnd="url(#wb-arrow-blue)" {...stroke} />
        <path className="draw" style={step(10)} pathLength={1} d="M332 270 C 290 290, 240 290, 184 262" stroke="var(--red-marker)" markerEnd="url(#wb-arrow-red)" {...stroke} />

        {/* tick under the conclusion */}
        <path className="draw" style={step(11)} pathLength={1} d="M34 352 L44 362 L62 340" stroke="var(--done)" {...stroke} strokeWidth={3.2} />
      </g>

      {/* handwriting */}
      <g fontFamily="var(--font-hand), cursive" fill="var(--ink)">
        <text className="ink-in" style={step(0)} x="30" y="46" fontSize="32" fontWeight="700">the event loop</text>
        <text className="ink-in" style={step(1)} x="103" y="118" fontSize="22" textAnchor="middle">call stack</text>
        <text className="ink-in" style={step(2)} x="103" y="295" fontSize="20" textAnchor="middle">main()</text>
        <text className="ink-in" style={step(3)} x="103" y="251" fontSize="20" textAnchor="middle">onClick()</text>
        <text className="ink-in" style={step(4)} x="348" y="116" fontSize="22" fill="var(--marker)">microtasks</text>
        <text className="ink-in" style={step(5)} x="386" y="150" fontSize="19" textAnchor="middle">.then()</text>
        <text className="ink-in" style={step(5)} x="477" y="150" fontSize="19" textAnchor="middle">await</text>
        <text className="ink-in" style={step(6)} x="348" y="252" fontSize="22" fill="var(--red-marker)">tasks</text>
        <text className="ink-in" style={step(7)} x="386" y="286" fontSize="19" textAnchor="middle">timer</text>
        <text className="ink-in" style={step(7)} x="477" y="286" fontSize="19" textAnchor="middle">click</text>
        <text className="ink-in" style={step(8)} x="256" y="207" fontSize="20" textAnchor="middle">loop</text>
        <text className="ink-in" style={step(9)} x="214" y="136" fontSize="21" fontWeight="700" fill="var(--marker)">drain all</text>
        <text className="ink-in" style={step(10)} x="218" y="318" fontSize="21" fontWeight="700" fill="var(--red-marker)">take one</text>
        <text className="ink-in" style={step(11)} x="74" y="361" fontSize="22" fill="var(--done)">so a promise runs before setTimeout(fn, 0)</text>
      </g>

      {/* marker tray */}
      <rect x="40" y="392" width="480" height="8" rx="4" fill="var(--line)" />
      <rect x="70" y="378" width="74" height="13" rx="6.5" fill="var(--marker)" />
      <rect x="156" y="378" width="74" height="13" rx="6.5" fill="var(--red-marker)" />
      <rect x="242" y="378" width="74" height="13" rx="6.5" fill="var(--done)" />
      <rect x="410" y="372" width="78" height="19" rx="5" fill="var(--ink-2)" opacity="0.55" />
    </svg>
  );
}
