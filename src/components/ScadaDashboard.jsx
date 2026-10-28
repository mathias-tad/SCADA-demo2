import React, { useState, useEffect, useRef } from 'react';

/* ─── helpers ──────────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand  = (range) => (Math.random() - 0.5) * 2 * range;
const fmt1  = (n) => n.toFixed(1);
const fmt0  = (n) => Math.round(n).toString();

/* ─── Sub-components ───────────────────────────────────────────────── */

/** LCD-style readout box rendered in SVG */
function LcdBox({ x, y, w = 120, h = 28, label, value, unit = '' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#000" stroke="#00ff41" strokeWidth={1} />
      <text x={x + 5} y={y + 10} fill="#00ff41" fontSize={7} fontFamily="monospace" opacity={0.7}>{label}</text>
      <text x={x + w - 4} y={y + 22} fill="#00ff41" fontSize={11} fontFamily="monospace"
            fontWeight="bold" textAnchor="end">{value}{unit}</text>
    </g>
  );
}

/** P&ID butterfly valve symbol */
function Valve({ x, y, open = true, label }) {
  const color = open ? '#22c55e' : '#ef4444';
  return (
    <g>
      {/* two triangles meeting at centre */}
      <polygon points={`${x - 8},${y - 8} ${x},${y} ${x - 8},${y + 8}`} fill={color} />
      <polygon points={`${x + 8},${y - 8} ${x},${y} ${x + 8},${y + 8}`} fill={color} />
      <circle cx={x} cy={y} r={2} fill="#fff" />
      {label && (
        <text x={x} y={y - 13} fill="#e2e8f0" fontSize={8} fontFamily="monospace" textAnchor="middle">{label}</text>
      )}
    </g>
  );
}

/** Centrifugal pump symbol */
function Pump({ x, y, running, label, flow }) {
  const bodyColor = running ? '#f0c040' : '#6b7280';
  const animRef   = useRef(null);
  return (
    <g>
      {/* body circle */}
      <circle cx={x} cy={y} r={28} fill={bodyColor} stroke="#374151" strokeWidth={2} />
      {/* impeller lines — rotates when running */}
      <g style={{ transformOrigin: `${x}px ${y}px` }}>
        {running && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`360 ${x} ${y}`}
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const r = Math.PI * deg / 180;
          return (
            <line key={deg}
              x1={x} y1={y}
              x2={x + 20 * Math.cos(r)}
              y2={y + 20 * Math.sin(r)}
              stroke={running ? '#92400e' : '#374151'}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      {/* discharge triangle */}
      <polygon
        points={`${x + 28},${y} ${x + 14},${y - 10} ${x + 14},${y + 10}`}
        fill="#374151"
      />
      {/* label */}
      <text x={x} y={y + 44} fill="#e2e8f0" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">{label}</text>
      <text x={x} y={y + 55} fill={running ? '#f0c040' : '#9ca3af'} fontSize={8} fontFamily="monospace" textAnchor="middle">
        {running ? '● RUNNING' : '○ STANDBY'}
      </text>
      {/* flow readout */}
      <LcdBox x={x - 46} y={y + 60} w={92} h={24} label="FLOW" value={flow} unit=" L/m" />
    </g>
  );
}

/** Cylindrical tank with fill */
function Tank({ x, y, id, pct, volume, warning }) {
  const W = 70, H = 140;
  const fillColor = warning ? '#f59e0b' : '#1e90ff';
  const fillH = (H - 16) * (pct / 100);
  const fillY = y + H - 10 - fillH;
  const clipId = `clip-tank-${id}`;
  return (
    <g>
      {/* clip path for liquid fill */}
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y + 8} width={W} height={H - 16} />
        </clipPath>
      </defs>
      {/* shell */}
      <rect x={x} y={y + 8} width={W} height={H - 16} fill="#1a3a4a" stroke="#4b6fa0" strokeWidth={2} />
      {/* liquid fill */}
      <rect x={x} y={fillY} width={W} height={fillH} fill={fillColor} opacity={0.85} clipPath={`url(#${clipId})`} />
      {/* animated wave surface */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M${x} ${fillY} q${W * 0.25} -6 ${W * 0.5} 0 q${W * 0.25} 6 ${W * 0.5} 0`}
          fill="none"
          stroke={fillColor}
          strokeWidth={3}
          opacity={0.9}
        >
          <animate attributeName="d"
            values={
              `M${x} ${fillY} q${W * 0.25} -6 ${W * 0.5} 0 q${W * 0.25} 6 ${W * 0.5} 0;` +
              `M${x} ${fillY} q${W * 0.25} 6 ${W * 0.5} 0 q${W * 0.25} -6 ${W * 0.5} 0;` +
              `M${x} ${fillY} q${W * 0.25} -6 ${W * 0.5} 0 q${W * 0.25} 6 ${W * 0.5} 0`
            }
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>
      </g>
      {/* top ellipse */}
      <ellipse cx={x + W / 2} cy={y + 8} rx={W / 2} ry={8} fill="#2a5080" stroke="#4b6fa0" strokeWidth={2} />
      {/* bottom ellipse */}
      <ellipse cx={x + W / 2} cy={y + H - 8} rx={W / 2} ry={8} fill="#1a3a4a" stroke="#4b6fa0" strokeWidth={2} />
      {/* level indicator bar (right side) */}
      <rect x={x + W + 4} y={y + 8} width={6} height={H - 16} fill="#0d1f2d" stroke="#4b6fa0" strokeWidth={1} />
      <rect x={x + W + 4} y={fillY} width={6} height={fillH} fill={fillColor} />
      {/* pct label on level bar */}
      <text x={x + W + 7} y={fillY - 3} fill={fillColor} fontSize={7} fontFamily="monospace" textAnchor="middle">{Math.round(pct)}%</text>
      {/* warning overlay */}
      {warning && (
        <text x={x + W / 2} y={y + H / 2 + 4} fill="#ef4444" fontSize={11} fontFamily="monospace" fontWeight="bold" textAnchor="middle">▲LOW</text>
      )}
      {/* labels below */}
      <text x={x + W / 2} y={y + H + 14} fill="#e2e8f0" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">{id}</text>
      <LcdBox x={x} y={y + H + 18} w={W} h={24} label="VOL" value={volume} unit=" ML" />
    </g>
  );
}

/** PRV symbol */
function PRV({ x, y, upstream, downstream }) {
  return (
    <g>
      <rect x={x - 30} y={y - 20} width={60} height={40} rx={4} fill="#374151" stroke="#6b7280" strokeWidth={2} />
      {/* diagonal slash = PRV symbol */}
      <line x1={x - 20} y1={y + 15} x2={x + 20} y2={y - 15} stroke="#f0c040" strokeWidth={2.5} />
      <text x={x} y={y - 28} fill="#e2e8f0" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">PRV-001</text>
      <LcdBox x={x - 72} y={y + 26} w={144} h={24} label="UPSTREAM" value={upstream} unit=" bar" />
      <LcdBox x={x - 72} y={y + 54} w={144} h={24} label="DOWNSTREAM" value={downstream} unit=" bar" />
    </g>
  );
}

/** Distribution zone node */
function ZoneNode({ x, y, label, pressure }) {
  return (
    <g>
      {/* house polygon */}
      <polygon points={`${x},${y - 24} ${x + 22},${y - 10} ${x + 22},${y + 18} ${x - 22},${y + 18} ${x - 22},${y - 10}`}
        fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} />
      {/* roof */}
      <polygon points={`${x - 26},${y - 10} ${x},${y - 30} ${x + 26},${y - 10}`}
        fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} />
      {/* window */}
      <rect x={x - 8} y={y - 4} width={16} height={12} fill="#93c5fd" opacity={0.5} />
      <text x={x} y={y + 32} fill="#93c5fd" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">{label}</text>
      <LcdBox x={x - 38} y={y + 38} w={76} h={24} label="PRES" value={pressure} unit=" bar" />
    </g>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function ScadaDashboard() {
  /* --- simulation state --- */
  const [tankLevels, setTankLevels]     = useState([62, 78, 41]);
  const [pump1Running, setPump1Running] = useState(true);
  const [pump2Running, setPump2Running] = useState(false);
  const [pressure, setPressure]         = useState({ sys: 4.2, upstream: 6.2, downstream: 4.1 });
  const [zonePres, setZonePres]         = useState([3.8, 3.5, 3.9]);
  const [totalFlow, setTotalFlow]       = useState(847);
  const [tick, setTick]                 = useState(0);

  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  /* --- live simulation --- */
  useEffect(() => {
    const id = setInterval(() => {
      setTankLevels(prev => prev.map((v, i) => {
        const delta = rand(1.2);
        const lo = i === 2 ? 35 : 50;
        return clamp(v + delta, lo, 99);
      }));
      setPressure(prev => ({
        sys:        clamp(prev.sys        + rand(0.12), 3.5, 5.2),
        upstream:   clamp(prev.upstream   + rand(0.1),  5.5, 7.2),
        downstream: clamp(prev.downstream + rand(0.08), 3.5, 5.0),
      }));
      setZonePres(prev => prev.map(v => clamp(v + rand(0.08), 2.8, 4.5)));
      setTotalFlow(prev => clamp(prev + rand(18), 700, 1000));
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  /* --- derived values --- */
  const pump1Flow = pump1Running ? Math.round(totalFlow * 0.72) : 0;
  const pump2Flow = pump2Running ? Math.round(totalFlow * 0.28) : 0;
  const volumes   = tankLevels.map(pct => ((pct / 100) * 2.8).toFixed(2));
  const netHealth = (98.4 + rand(0.3)).toFixed(1);

  /* --- pipe animation speed (active vs none) --- */
  const pipeAnim = (active) => active
    ? { stroke: '#1e90ff', strokeDasharray: '16 8', animation: 'pid-flow 1.2s linear infinite' }
    : { stroke: '#334155', strokeDasharray: '16 8' };

  const redPipeStyle = { stroke: '#ef4444', strokeDasharray: '12 6', animation: 'pid-flow-red 1.5s linear infinite' };

  return (
    <div className="d1-scada-screen">
      {/* ── Status strip above SVG ── */}
      <div className="d1-status-strip">
        <span className="d1-badge d1-badge--online">● SYSTEM ONLINE</span>
        <span className="d1-badge d1-badge--ok">● COMMS OK</span>
        <span className="d1-badge d1-badge--warn">▲ 2 ALARMS ACTIVE</span>
        <span className="d1-badge d1-badge--info">⏱ AUTO-SCAN: 2s</span>
        <span className="d1-badge d1-badge--ts">{timestamp}</span>
        {/* pump toggle buttons */}
        <button className={`d1-btn ${pump1Running ? 'd1-btn--stop' : 'd1-btn--start'}`}
          onClick={() => setPump1Running(r => !r)}>
          PMP-001: {pump1Running ? 'STOP' : 'START'}
        </button>
        <button className={`d1-btn ${pump2Running ? 'd1-btn--stop' : 'd1-btn--start'}`}
          onClick={() => setPump2Running(r => !r)}>
          PMP-002: {pump2Running ? 'STOP' : 'START'}
        </button>
      </div>

      {/* ── Main SVG ── */}
      <svg
        className="d1-pid-svg"
        width="100%"
        viewBox="0 0 1400 720"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── DEFS: grid pattern, arrow marker, clip paths ── */}
        <defs>
          {/* dot grid */}
          <pattern id="pid-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1" fill="#2d8c7e" />
          </pattern>
          {/* flow arrow marker – blue */}
          <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
          </marker>
          {/* flow arrow marker – red */}
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f87171" />
          </marker>
          {/* flow arrow marker – yellow (control) */}
          <marker id="arrow-yellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#fbbf24" />
          </marker>
        </defs>

        {/* ── Background ── */}
        <rect width={1400} height={720} fill="#1a5c52" />
        <rect width={1400} height={720} fill="url(#pid-grid)" />

        {/* ── Header bar ── */}
        <rect x={0} y={0} width={1400} height={50} fill="#0d3d35" />
        <text x={700} y={32} fill="#ffffff" fontSize={16} fontFamily="monospace" fontWeight="bold"
              textAnchor="middle" letterSpacing={3}>
          WATER DISTRIBUTION SYSTEM — LIVE MONITOR
        </text>
        {/* timestamp */}
        <text x={1380} y={32} fill="#94a3b8" fontSize={10} fontFamily="monospace" textAnchor="end">{timestamp}</text>
        {/* alarm indicators */}
        <circle cx={30} cy={25} r={8} fill="#22c55e" />
        <text x={42} y={29} fill="#94a3b8" fontSize={8} fontFamily="monospace">PWR</text>
        <circle cx={80} cy={25} r={8} fill="#22c55e" />
        <text x={92} y={29} fill="#94a3b8" fontSize={8} fontFamily="monospace">COMMS</text>
        <circle cx={138} cy={25} r={8} fill="#f59e0b" />
        <text x={150} y={29} fill="#94a3b8" fontSize={8} fontFamily="monospace">ALARM</text>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  PIPE NETWORK                                                  */}
        {/* ══════════════════════════════════════════════════════════════ */}

        {/* Reservoir → Pump manifold vertical header (x=200) */}
        <path d="M 160 350 H 232" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(pump1Running || pump2Running)} />
        {/* manifold vertical */}
        <path d="M 232 300 V 450" fill="none" strokeWidth={8} stroke="#334155" strokeDasharray="none" />
        {/* Pump 1 suction */}
        <path d="M 232 300 H 260" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(pump1Running)} />
        {/* Pump 2 suction */}
        <path d="M 232 450 H 260" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(pump2Running)} />

        {/* Pump 1 discharge → tank header */}
        <path d="M 288 300 H 360 V 540" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(pump1Running)} />
        {/* Pump 2 discharge → tank header */}
        <path d="M 288 450 H 360" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(pump2Running)} />

        {/* Tank header horizontal (x=360, y=540) */}
        <path d="M 360 540 H 820" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(pump1Running || pump2Running)} />
        {/* Tank drops */}
        <path d="M 500 540 V 680" fill="none" strokeWidth={6} style={pipeAnim(pump1Running || pump2Running)} />
        <path d="M 620 540 V 680" fill="none" strokeWidth={6} style={pipeAnim(pump1Running || pump2Running)} />
        <path d="M 740 540 V 680" fill="none" strokeWidth={6} style={pipeAnim(pump1Running || pump2Running)} />

        {/* Tanks → PRV header */}
        <path d="M 820 540 V 350 H 920" fill="none" strokeWidth={8} markerEnd="url(#arrow-blue)"
              style={pipeAnim(true)} />

        {/* PRV → distribution */}
        <path d="M 980 350 H 1080" fill="none" strokeWidth={6} markerEnd="url(#arrow-red)"
              style={redPipeStyle} />
        {/* distribution header vertical */}
        <path d="M 1080 200 V 500" fill="none" strokeWidth={6} stroke="#ef4444" strokeDasharray="12 6"
              style={redPipeStyle} />
        {/* zone branches */}
        <path d="M 1080 230 H 1160" fill="none" strokeWidth={5} markerEnd="url(#arrow-red)"
              style={redPipeStyle} />
        <path d="M 1080 365 H 1160" fill="none" strokeWidth={5} markerEnd="url(#arrow-red)"
              style={redPipeStyle} />
        <path d="M 1080 490 H 1160" fill="none" strokeWidth={5} markerEnd="url(#arrow-red)"
              style={redPipeStyle} />

        {/* control signal lines (dashed yellow, thin) */}
        <path d="M 200 520 H 260 V 310" fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 4"
              markerEnd="url(#arrow-yellow)" />
        <path d="M 200 520 H 260 V 460" fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 4"
              markerEnd="url(#arrow-yellow)" />
        <path d="M 200 520 H 950 V 390" fill="none" stroke="#fbbf24" strokeWidth={1} strokeDasharray="5 4"
              markerEnd="url(#arrow-yellow)" opacity={0.5} />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  VALVES                                                        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <Valve x={180} y={350} open={true}  label="V-01" />
        <Valve x={232} y={380} open={true}  label="V-02" />
        <Valve x={330} y={300} open={pump1Running} label="V-03" />
        <Valve x={330} y={450} open={pump2Running} label="V-04" />
        <Valve x={500} y={540} open={true}  label="V-05" />
        <Valve x={620} y={540} open={true}  label="V-06" />
        <Valve x={740} y={540} open={true}  label="V-07" />
        <Valve x={880} y={350} open={true}  label="V-08" />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  RESERVOIR                                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <g>
          {/* wavy top path */}
          <path d="M 40 310 q 15 -16 30 0 q 15 16 30 0 q 15 -16 30 0 q 15 16 30 0 V 410 H 40 Z"
                fill="#1e6aa8" stroke="#3b82f6" strokeWidth={2} />
          {/* level indicator bar */}
          <rect x={32} y={310} width={6} height={100} fill="#0d1f2d" stroke="#3b82f6" strokeWidth={1} />
          <rect x={32} y={345} width={6} height={65} fill="#1e90ff" />
          <text x={80} y={424} fill="#93c5fd" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">RESERVOIR</text>
          <text x={80} y={436} fill="#93c5fd" fontSize={9} fontFamily="monospace" textAnchor="middle">RES-001</text>
          <LcdBox x={36} y={440} w={90} h={24} label="LEVEL" value="65" unit="%" />
        </g>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  PUMPS                                                         */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <Pump x={274} y={300} running={pump1Running} label="PMP-001" flow={pump1Flow} />
        <Pump x={274} y={450} running={pump2Running} label="PMP-002" flow={pump2Flow} />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  TANK FARM                                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <Tank x={465}  y={390} id="TK-001" pct={tankLevels[0]} volume={volumes[0]} warning={false} />
        <Tank x={585}  y={390} id="TK-002" pct={tankLevels[1]} volume={volumes[1]} warning={false} />
        <Tank x={705}  y={390} id="TK-003" pct={tankLevels[2]} volume={volumes[2]} warning={tankLevels[2] < 45} />

        {/* Tank farm label */}
        <text x={620} y={378} fill="#94a3b8" fontSize={10} fontFamily="monospace" textAnchor="middle" letterSpacing={2} opacity={0.8}>
          ─── TANK FARM ───
        </text>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  PRV STATION                                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <PRV x={950} y={350} upstream={fmt1(pressure.upstream)} downstream={fmt1(pressure.downstream)} />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  DISTRIBUTION ZONES                                            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <ZoneNode x={1210} y={230} label="ZONE A" pressure={fmt1(zonePres[0])} />
        <ZoneNode x={1210} y={365} label="ZONE B" pressure={fmt1(zonePres[1])} />
        <ZoneNode x={1210} y={490} label="ZONE C" pressure={fmt1(zonePres[2])} />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  CONTROL PANEL (bottom-left)                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <rect x={28} y={470} width={188} height={220} rx={6} fill="#0d1f2d" stroke="#1e3a5f" strokeWidth={2} />
        <rect x={28} y={470} width={188} height={22} rx={6} fill="#0a1628" />
        <text x={122} y={485} fill="#94a3b8" fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={2}>CONTROL PANEL</text>

        {/* LCD readouts */}
        <LcdBox x={38} y={498} w={168} h={28} label="SYS PRESSURE" value={fmt1(pressure.sys)} unit=" bar" />
        <LcdBox x={38} y={532} w={168} h={28} label="TOTAL FLOW"   value={fmt0(totalFlow)}     unit=" L/m" />
        <LcdBox x={38} y={566} w={168} h={28} label="NETWORK HLT"  value={netHealth}            unit="%" />
        <LcdBox x={38} y={600} w={168} h={28} label="ACTIVE ALRM"  value="2"                    unit="" />

        {/* Indicator lights */}
        <circle cx={50}  cy={646} r={7} fill="#22c55e" />
        <text x={62}  y={650} fill="#94a3b8" fontSize={8} fontFamily="monospace">POWER</text>
        <circle cx={108} cy={646} r={7} fill="#22c55e" />
        <text x={120} y={650} fill="#94a3b8" fontSize={8} fontFamily="monospace">COMMS</text>
        <circle cx={50}  cy={668} r={7} fill="#f59e0b" />
        <text x={62}  y={672} fill="#94a3b8" fontSize={8} fontFamily="monospace">ALARM</text>
        <circle cx={108} cy={668} r={7} fill="#22c55e" />
        <text x={120} y={672} fill="#94a3b8" fontSize={8} fontFamily="monospace">FAULT</text>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  SECTION LABELS / CALLOUTS                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <text x={80}  y={64} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">SOURCE</text>
        <text x={274} y={64} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">PUMP STN</text>
        <text x={620} y={64} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">STORAGE / TANK FARM</text>
        <text x={950} y={64} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">PRV STN</text>
        <text x={1210} y={64} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">DISTRIBUTION</text>
        {/* section dividers */}
        {[156, 400, 840, 1090].map(lx => (
          <line key={lx} x1={lx} y1={55} x2={lx} y2={720} stroke="#1e3a5f" strokeWidth={1} strokeDasharray="4 4" />
        ))}

        {/* footer bar */}
        <rect x={0} y={700} width={1400} height={20} fill="#0d3d35" />
        <text x={700} y={714} fill="#4b6fa0" fontSize={8} fontFamily="monospace" textAnchor="middle" letterSpacing={2}>
          EEMACS v2 — P&amp;ID PROCESS DIAGRAM — WATER DISTRIBUTION — {timestamp}
        </text>
      </svg>
    </div>
  );
}
