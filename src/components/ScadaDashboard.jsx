import React, { useState, useEffect } from 'react';

/* ─── tiny helpers ────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand  = (range) => (Math.random() - 0.5) * 2 * range;

/* ─── SVG semi-circle arc gauge ───────────────────────────────────── */
function ArcGauge({ value, max, label, color }) {
  const pct     = clamp(value / max, 0, 1);
  const R       = 54;
  const cx      = 70;
  const cy      = 70;
  const startA  = Math.PI;               // 180° left
  const sweepA  = Math.PI;               // 180° sweep (half circle)
  const angle   = startA + sweepA * pct;
  const x1      = cx + R * Math.cos(startA);
  const y1      = cy + R * Math.sin(startA);
  const x2      = cx + R * Math.cos(Math.PI + Math.PI); // right end of arc
  const arcX    = cx + R * Math.cos(angle);
  const arcY    = cy + R * Math.sin(angle);

  // background arc path (full half-circle)
  const bgPath  = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  // value arc path
  const largeArc = sweepA * pct > Math.PI ? 1 : 0;
  const valPath  = pct > 0
    ? `M ${cx - R} ${cy} A ${R} ${R} 0 ${largeArc} 1 ${arcX} ${arcY}`
    : '';

  return (
    <div className="d1-arc-gauge-wrap">
      <svg width="140" height="82" viewBox="0 0 140 82">
        {/* track */}
        <path d={bgPath} fill="none" stroke="#1e3a5f" strokeWidth="10" strokeLinecap="round"/>
        {/* value */}
        {pct > 0 && (
          <path d={valPath} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"/>
        )}
        {/* needle dot */}
        <circle cx={arcX} cy={arcY} r="5" fill={color}/>
        {/* center value text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="700">
          {value.toFixed(1)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="10">
          bar
        </text>
      </svg>
      <div className="d1-arc-label">{label}</div>
    </div>
  );
}

/* ─── Pressure wave (animated SVG sine) ──────────────────────────── */
function PressureWave({ color }) {
  return (
    <svg className="d1-pressure-wave" viewBox="0 0 200 32" preserveAspectRatio="none">
      <path
        d="M0 16 C20 4, 40 28, 60 16 S100 4, 120 16 S160 28, 180 16 S200 4, 200 16"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-60 0"
          to="0 0"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0 16 C20 4, 40 28, 60 16 S100 4, 120 16 S160 28, 180 16 S200 4, 200 16"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 0"
          to="60 0"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function ScadaDashboard() {

  /* ── state ── */
  const [sysPressure,  setSysPressure]  = useState(4.2);
  const [flowRate,     setFlowRate]     = useState(847);
  const [activeAlarms, setActiveAlarms] = useState(2);
  const [sysHealth,    setSysHealth]    = useState(98.4);

  // tanks: { level%, volume ML, height m }
  const [tankAlpha, setTankAlpha] = useState({ level: 62, volume: 3.1, height: 4.65 });
  const [tankBeta,  setTankBeta]  = useState({ level: 78, volume: 3.9, height: 5.85 });
  const [tankGamma, setTankGamma] = useState({ level: 41, volume: 2.05, height: 3.075 });

  // pumps
  const [pump1, setPump1] = useState({ running: true,  flow: 312, pressure: 3.8, rpm: 1450, runtime: '4h 23m' });
  const [pump2, setPump2] = useState({ running: false, flow: 0,   pressure: 0.0, rpm: 0,    runtime: '0h 00m' });

  // PRV
  const [prvUp,   setPrvUp]   = useState(6.2);
  const [prvDown, setPrvDown] = useState(4.1);

  /* ── simulation tick ── */
  useEffect(() => {
    const id = setInterval(() => {
      setSysPressure(p  => +clamp(p + rand(0.2), 3.5, 5.2).toFixed(2));
      setFlowRate   (f  => Math.round(clamp(f + rand(15), 750, 950)));
      setSysHealth  (h  => +clamp(h + rand(0.3), 96, 99.9).toFixed(1));

      setTankAlpha(t => {
        const lv = clamp(t.level + rand(2), 20, 95);
        return { level: +lv.toFixed(1), volume: +(lv / 100 * 5).toFixed(2), height: +(lv / 100 * 7.5).toFixed(2) };
      });
      setTankBeta(t => {
        const lv = clamp(t.level + rand(2), 20, 95);
        return { level: +lv.toFixed(1), volume: +(lv / 100 * 5).toFixed(2), height: +(lv / 100 * 7.5).toFixed(2) };
      });
      setTankGamma(t => {
        const lv = clamp(t.level + rand(2), 10, 90);
        return { level: +lv.toFixed(1), volume: +(lv / 100 * 5).toFixed(2), height: +(lv / 100 * 7.5).toFixed(2) };
      });

      setPump1(p => p.running
        ? { ...p, flow: Math.round(clamp(p.flow + rand(15), 260, 380)), pressure: +clamp(p.pressure + rand(0.2), 3.2, 4.5).toFixed(2), rpm: Math.round(clamp(p.rpm + rand(30), 1380, 1520)) }
        : p
      );
      setPump2(p => p.running
        ? { ...p, flow: Math.round(clamp(p.flow + rand(15), 260, 380)), pressure: +clamp(p.pressure + rand(0.2), 3.2, 4.5).toFixed(2), rpm: Math.round(clamp(p.rpm + rand(30), 1380, 1520)) }
        : p
      );

      setPrvUp  (v => +clamp(v + rand(0.2), 5.5, 7.0).toFixed(2));
      setPrvDown(v => +clamp(v + rand(0.15), 3.5, 4.8).toFixed(2));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  /* ── pump toggle ── */
  const togglePump = (which) => {
    if (which === 1) {
      setPump1(p => ({
        ...p,
        running: !p.running,
        flow: !p.running ? 312 : 0,
        pressure: !p.running ? 3.8 : 0.0,
        rpm: !p.running ? 1450 : 0,
      }));
    } else {
      setPump2(p => ({
        ...p,
        running: !p.running,
        flow: !p.running ? 295 : 0,
        pressure: !p.running ? 3.6 : 0.0,
        rpm: !p.running ? 1420 : 0,
      }));
    }
  };

  /* ── tank level setter from slider ── */
  const setTankLevel = (setter, lv) => {
    const level = parseFloat(lv);
    setter({ level, volume: +(level / 100 * 5).toFixed(2), height: +(level / 100 * 7.5).toFixed(2) });
  };

  /* ── alert feed ── */
  const alerts = [
    { type: 'WARN', msg: 'Tank Gamma level below 45% threshold',   time: '2 min ago'  },
    { type: 'INFO', msg: 'Pump Station 2 started',                  time: '8 min ago'  },
    { type: 'CRIT', msg: 'PRV downstream pressure spike detected',  time: '15 min ago' },
    { type: 'INFO', msg: 'User Pete logged in from 192.168.1.42',   time: '22 min ago' },
    { type: 'OK',   msg: 'Tank Alpha refill completed successfully', time: '1 hr ago'   },
  ];
  const alertColor = { CRIT: '#ef4444', WARN: '#f59e0b', INFO: '#1e90ff', OK: '#10b981' };
  const alertIcon  = { CRIT: '⚡', WARN: '⚠', INFO: 'ℹ', OK: '✓' };

  /* ── tank fill color ── */
  const tankColor = (lv) => lv < 30 ? '#ef4444' : lv < 50 ? '#f59e0b' : '#1e90ff';
  const tankStatus = (lv) => lv < 30 ? 'CRITICAL' : lv < 50 ? 'LOW' : 'NORMAL';
  const tankStatusCls = (lv) => lv < 30 ? 'd1-badge-crit' : lv < 50 ? 'd1-badge-warn' : 'd1-badge-ok';

  const prvRatio = prvUp > 0 ? ((1 - prvDown / prvUp) * 100).toFixed(1) : 0;

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="d1-dashboard">

      {/* ── SYSTEM HEADER BAR ── */}
      <div className="d1-header-bar">
        <div className="d1-header-left">
          <span className="d1-live-dot"/>
          <span className="d1-header-title">SCADA CONTROL ROOM</span>
          <span className="d1-header-subtitle">Enterprise Monitoring System • v4.2.1</span>
        </div>
        <div className="d1-header-right">
          <span className="d1-header-meta">UTC+3 &nbsp;|&nbsp; Node: MASTER-01 &nbsp;|&nbsp; Poll: 2s</span>
          <span className="d1-online-pill">● LIVE</span>
        </div>
      </div>

      {/* ── TOP ROW: KPI CARDS ── */}
      <div className="d1-kpi-row">

        {/* 1 — System Pressure */}
        <div className="d1-kpi-card d1-kpi-green">
          <div className="d1-kpi-accent"/>
          <div className="d1-kpi-body">
            <div className="d1-kpi-label">System Pressure</div>
            <div className="d1-kpi-value">{sysPressure.toFixed(2)}<span className="d1-kpi-unit"> bar</span></div>
            <div className="d1-kpi-trend d1-trend-up">▲ +0.3 vs 1h avg</div>
          </div>
          <div className="d1-kpi-icon">⬡</div>
        </div>

        {/* 2 — Flow Rate */}
        <div className="d1-kpi-card d1-kpi-blue">
          <div className="d1-kpi-accent"/>
          <div className="d1-kpi-body">
            <div className="d1-kpi-label">Network Flow Rate</div>
            <div className="d1-kpi-value">{flowRate}<span className="d1-kpi-unit"> L/min</span></div>
            <div className="d1-kpi-trend d1-trend-stable">→ Stable</div>
          </div>
          <div className="d1-kpi-icon">◈</div>
        </div>

        {/* 3 — Active Alarms */}
        <div className="d1-kpi-card d1-kpi-amber">
          <div className="d1-kpi-accent"/>
          <div className="d1-kpi-body">
            <div className="d1-kpi-label">Active Alarms</div>
            <div className="d1-kpi-value">{activeAlarms}<span className="d1-kpi-unit"> active</span></div>
            <div className="d1-kpi-trend d1-trend-up">▲ +1 since last hour</div>
          </div>
          <div className="d1-kpi-icon">⚠</div>
        </div>

        {/* 4 — System Health */}
        <div className="d1-kpi-card d1-kpi-green">
          <div className="d1-kpi-accent"/>
          <div className="d1-kpi-body">
            <div className="d1-kpi-label">System Health</div>
            <div className="d1-kpi-value">{sysHealth.toFixed(1)}<span className="d1-kpi-unit">%</span></div>
            <div className="d1-kpi-trend">
              <span className="d1-pulse-dot"/>
              <span style={{ color: '#10b981' }}>All Systems Nominal</span>
            </div>
          </div>
          <div className="d1-kpi-icon">✦</div>
        </div>

      </div>

      {/* ── MIDDLE ROW ── */}
      <div className="d1-mid-row">

        {/* LEFT: Tank Monitoring Panel */}
        <div className="d1-panel d1-tanks-panel">
          <div className="d1-panel-header">
            <span className="d1-panel-title">Storage Tanks — Live Levels</span>
            <span className="d1-panel-badge">3 UNITS ONLINE</span>
          </div>

          <div className="d1-tanks-grid">
            {[
              { name: 'Tank Alpha', data: tankAlpha, setter: setTankAlpha },
              { name: 'Tank Beta',  data: tankBeta,  setter: setTankBeta  },
              { name: 'Tank Gamma', data: tankGamma, setter: setTankGamma },
            ].map(({ name, data, setter }) => {
              const color = tankColor(data.level);
              return (
                <div className="d1-tank-card" key={name}>
                  <div className="d1-tank-name">{name}</div>

                  {/* Vertical gauge */}
                  <div className="d1-tank-gauge-wrap">
                    {/* min/max lines */}
                    <div className="d1-tank-line d1-tank-line-hi" title="High: 90%"/>
                    <div className="d1-tank-line d1-tank-line-lo" title="Low: 30%"/>
                    <div className="d1-tank-outer">
                      <div
                        className="d1-tank-fill"
                        style={{
                          height: `${data.level}%`,
                          background: `linear-gradient(to top, ${color}dd, ${color}88)`,
                          boxShadow: `0 0 12px ${color}66`,
                        }}
                      >
                        <div className="d1-tank-shimmer"/>
                      </div>
                    </div>
                    <div className="d1-tank-pct" style={{ color }}>{data.level.toFixed(1)}%</div>
                  </div>

                  {/* slider */}
                  <div className="d1-tank-slider-wrap">
                    <label className="d1-slider-label">Simulate Level</label>
                    <input
                      type="range"
                      className="d1-slider"
                      min="5" max="95" step="0.5"
                      value={data.level}
                      onChange={e => setTankLevel(setter, e.target.value)}
                      style={{ accentColor: color }}
                    />
                  </div>

                  {/* meta row */}
                  <div className="d1-tank-meta">
                    <div className="d1-tank-meta-item">
                      <span className="d1-meta-lbl">Volume</span>
                      <span className="d1-meta-val">{data.volume} ML</span>
                    </div>
                    <div className="d1-tank-meta-item">
                      <span className="d1-meta-lbl">Height</span>
                      <span className="d1-meta-val">{data.height} m</span>
                    </div>
                    <div className="d1-tank-meta-item">
                      <span className={`d1-badge ${tankStatusCls(data.level)}`}>
                        {tankStatus(data.level)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Alerts Feed */}
        <div className="d1-panel d1-alerts-panel">
          <div className="d1-panel-header">
            <span className="d1-panel-title">System Alerts</span>
            <span className="d1-badge d1-badge-crit" style={{ fontSize: '11px', padding: '2px 8px' }}>
              {alerts.filter(a => a.type === 'CRIT' || a.type === 'WARN').length} Active
            </span>
          </div>

          <div className="d1-alerts-list">
            {alerts.map((a, i) => (
              <div className="d1-alert-item" key={i}
                style={{ borderLeftColor: alertColor[a.type] }}>
                <div className="d1-alert-icon" style={{ color: alertColor[a.type] }}>
                  {alertIcon[a.type]}
                </div>
                <div className="d1-alert-content">
                  <div className="d1-alert-type-row">
                    <span className="d1-alert-type" style={{ color: alertColor[a.type] }}>[{a.type}]</span>
                    <span className="d1-alert-time">{a.time}</span>
                  </div>
                  <div className="d1-alert-msg">{a.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="d1-bot-row">

        {/* LEFT: Pump Stations */}
        <div className="d1-panel d1-pumps-panel">
          <div className="d1-panel-header">
            <span className="d1-panel-title">Pump Stations</span>
            <span className="d1-panel-badge">
              {(pump1.running ? 1 : 0) + (pump2.running ? 1 : 0)} RUNNING
            </span>
          </div>

          <div className="d1-pumps-grid">
            {[
              { label: 'Pump Station 1', idx: 1, state: pump1, toggle: () => togglePump(1) },
              { label: 'Pump Station 2', idx: 2, state: pump2, toggle: () => togglePump(2) },
            ].map(({ label, idx, state, toggle }) => (
              <div className="d1-pump-card" key={idx}>
                <div className="d1-pump-top">
                  <div className="d1-pump-status-wrap">
                    <span className={`d1-pump-ring ${state.running ? 'd1-ring-running' : 'd1-ring-standby'}`}>
                      <span className={`d1-pump-dot ${state.running ? 'd1-dot-green' : 'd1-dot-amber'}`}/>
                    </span>
                    <div>
                      <div className="d1-pump-name">{label}</div>
                      <div className={`d1-pump-status-txt ${state.running ? 'd1-col-green' : 'd1-col-amber'}`}>
                        {state.running ? '● RUNNING' : '◐ STANDBY'}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`d1-pump-btn ${state.running ? 'd1-btn-stop' : 'd1-btn-start'}`}
                    onClick={toggle}
                  >
                    {state.running ? '⏹ STOP' : '▶ START'}
                  </button>
                </div>

                <div className="d1-pump-metrics">
                  <div className="d1-pump-metric">
                    <span className="d1-pm-lbl">Flow</span>
                    <span className="d1-pm-val d1-col-blue">{state.flow} <small>L/min</small></span>
                  </div>
                  <div className="d1-pump-metric">
                    <span className="d1-pm-lbl">Pressure</span>
                    <span className="d1-pm-val d1-col-green">{state.pressure.toFixed(1)} <small>bar</small></span>
                  </div>
                  <div className="d1-pump-metric">
                    <span className="d1-pm-lbl">RPM</span>
                    <span className="d1-pm-val">{state.rpm}</span>
                  </div>
                  <div className="d1-pump-metric">
                    <span className="d1-pm-lbl">Runtime</span>
                    <span className="d1-pm-val">{state.runtime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PRV Station */}
        <div className="d1-panel d1-prv-panel">
          <div className="d1-panel-header">
            <span className="d1-panel-title">PRV Station Alpha</span>
            <span className="d1-badge d1-badge-ok">ACTIVE</span>
          </div>

          <div className="d1-prv-gauges">
            <ArcGauge value={prvUp}   max={10} label="Upstream Pressure"   color="#ef4444"/>
            <div className="d1-prv-arrow">
              <span className="d1-prv-arrow-icon">⟹</span>
              <span className="d1-prv-ratio">{prvRatio}% reduction</span>
            </div>
            <ArcGauge value={prvDown} max={10} label="Downstream Pressure" color="#10b981"/>
          </div>

          <div className="d1-prv-meta">
            <div className="d1-prv-meta-item">
              <span className="d1-meta-lbl">Valve Position</span>
              <span className="d1-meta-val">65% OPEN</span>
            </div>
            <div className="d1-prv-meta-item">
              <span className="d1-meta-lbl">Set Point</span>
              <span className="d1-meta-val">4.0 bar</span>
            </div>
            <div className="d1-prv-meta-item">
              <span className="d1-meta-lbl">Mode</span>
              <span className="d1-meta-val d1-col-green">AUTO</span>
            </div>
          </div>

          <PressureWave color="#1e90ff"/>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div className="d1-footer">
        <span>EEMACS Control Room Dashboard — Design 1</span>
        <span>© 2026 Enterprise Edition</span>
        <span className="d1-footer-live">⬤ Live Data Stream Active</span>
      </div>

    </div>
  );
}
