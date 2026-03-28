import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const COLLEGES = [
  { id: 0, name: "American River",  short: "ARC", district: "Los Rios" },
  { id: 1, name: "Sacramento City", short: "SCC", district: "Los Rios" },
  { id: 2, name: "Folsom Lake",     short: "FLC", district: "Los Rios" },
  { id: 3, name: "Norco College",   short: "NOR", district: "Riverside" },
  { id: 4, name: "Riverside City",  short: "RCC", district: "Riverside" },
];

// flows[i][j] = enrollments FROM college i TO college j
const FLOWS = [
  [  0, 100,  45,  12,   8 ],
  [ 55,   0,  80,   6,  14 ],
  [ 30,  60,   0,   3,   5 ],
  [ 18,   9,   4,   0, 210 ],
  [ 22,  11,   7, 130,   0 ],
];

const COLORS = ["#00d4ff", "#f472b6", "#34d399", "#fbbf24", "#a78bfa"];
const TAU = Math.PI * 2;

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Chord helpers ─────────────────────────────────────────────────────────────
function computeChordLayout(colleges, flows) {
  const n = colleges.length;
  const gap = 0.03;
  const totals = colleges.map(ci =>
    colleges.reduce((s, cj) => s + flows[ci.id][cj.id] + flows[cj.id][ci.id], 0)
  );
  const grand = totals.reduce((a, b) => a + b, 0) || 1;
  const usable = TAU - gap * n;

  const arcStart = [], arcEnd = [];
  let angle = -Math.PI / 2;
  colleges.forEach((_, k) => {
    const span = (totals[k] / grand) * usable;
    arcStart[k] = angle;
    arcEnd[k] = angle + span;
    angle += span + gap;
  });

  // Per-pair sub-angles
  const sub = colleges.map(() => ({}));
  colleges.forEach((ci, k) => {
    const span = arcEnd[k] - arcStart[k];
    const total = totals[k] || 1;
    let cursor = arcStart[k];
    colleges.forEach((cj, m) => {
      if (k === m) return;
      const out = (flows[ci.id][cj.id] / total) * span;
      const inn = (flows[cj.id][ci.id] / total) * span;
      sub[k][m] = { outS: cursor, outE: cursor + out, inS: cursor + out, inE: cursor + out + inn };
      cursor += out + inn;
    });
  });

  return { arcStart, arcEnd, sub, totals };
}

function polar(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }

function arcSvg(r, a1, a2) {
  const [x1, y1] = polar(r, a1);
  const [x2, y2] = polar(r, a2);
  return `A ${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
}

function ribbon(r, s1, e1, s2, e2) {
  const [ax, ay] = polar(r, s1);
  const [bx, by] = polar(r, e1);
  const [cx2, cy2] = polar(r, s2);
  const [dx, dy] = polar(r, e2);
  return `M${ax} ${ay} ${arcSvg(r,s1,e1)} Q0 0 ${cx2} ${cy2} ${arcSvg(r,s2,e2)} Q0 0 ${ax} ${ay}Z`;
}

// ── Chord Diagram ─────────────────────────────────────────────────────────────
function ChordDiagram({ colleges, flows, active, onToggle, hovered, onHover }) {
  const R = 120, RT = 138;
  const layout = useMemo(() => computeChordLayout(colleges, flows), [colleges, flows]);
  const { arcStart, arcEnd, sub } = layout;

  return (
    <svg viewBox="-165 -165 330 330" style={{ width: "100%", height: "100%" }}>
      {/* Ribbons */}
      {colleges.map((ci, k) =>
        colleges.map((cj, m) => {
          if (m <= k) return null;
          if (!active.has(ci.id) || !active.has(cj.id)) return null;
          const sk = sub[k][m], sm = sub[m][k];
          if (!sk || !sm) return null;
          const isHov = hovered && (hovered.k === k || hovered.k === m);
          return (
            <path key={`r${k}-${m}`}
              d={ribbon(R, sk.outS, sk.outE, sm.inS, sm.inE)}
              fill={COLORS[k]} stroke={COLORS[k]} strokeWidth="0.4"
              opacity={isHov ? 0.7 : 0.22}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => onHover({ k, m, ci, cj, fwd: flows[ci.id][cj.id], bwd: flows[cj.id][ci.id] })}
              onMouseLeave={() => onHover(null)}
            />
          );
        })
      )}

      {/* Arcs */}
      {colleges.map((c, k) => {
        const isAct = active.has(c.id);
        const a1 = arcStart[k], a2 = arcEnd[k];
        const [x1, y1] = polar(R, a1);
        const [x2, y2] = polar(R, a2);
        const [lx, ly] = polar(RT + 10, (a1 + a2) / 2);
        const mid = (a1 + a2) / 2;
        const isHov = hovered?.k === k;
        return (
          <g key={`a${k}`} onClick={() => onToggle(c.id)} style={{ cursor: "pointer" }}>
            <path
              d={`M${x1} ${y1} A${R} ${R} 0 ${a2-a1>Math.PI?1:0} 1 ${x2} ${y2}`}
              fill="none" stroke={COLORS[k]}
              strokeWidth={isAct ? (isHov ? 15 : 11) : 5}
              strokeOpacity={isAct ? 1 : 0.15}
              strokeLinecap="round"
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize={isHov ? "11" : "9"} fontWeight={isHov ? "700" : "400"}
              fontFamily="'DM Mono',monospace"
              fill={isAct ? COLORS[k] : "#2d3748"}
              transform={`rotate(${mid * 180/Math.PI + 90},${lx},${ly})`}>
              {c.short}
            </text>
          </g>
        );
      })}

      {/* Hover tooltip center */}
      {hovered && (() => {
        const { ci, cj, fwd, bwd, k, m } = hovered;
        return (
          <g pointerEvents="none">
            <text textAnchor="middle" y="-22" fontSize="9" fill={COLORS[k]} fontFamily="monospace" fontWeight="700">{ci.short} → {cj.short}</text>
            <text textAnchor="middle" y="-6" fontSize="22" fill="#e2e8f0" fontFamily="monospace" fontWeight="700">{fwd}</text>
            <text textAnchor="middle" y="8" fontSize="8" fill="#475569" fontFamily="monospace">enrollments</text>
            <line x1="-25" x2="25" y1="14" y2="14" stroke="#1e293b" strokeWidth="1"/>
            <text textAnchor="middle" y="26" fontSize="9" fill={COLORS[m]} fontFamily="monospace" fontWeight="700">{cj.short} → {ci.short}</text>
            <text textAnchor="middle" y="42" fontSize="22" fill="#e2e8f0" fontFamily="monospace" fontWeight="700">{bwd}</text>
            <text textAnchor="middle" y="56" fontSize="8" fill="#475569" fontFamily="monospace">enrollments</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ── Force Graph ───────────────────────────────────────────────────────────────
function useForce(colleges, flows) {
  const [pos, setPos] = useState(() => {
    const rand = seededRand(99);
    const p = {};
    colleges.forEach(c => { p[c.id] = { x: (rand()-.5)*180, y: (rand()-.5)*180 }; });
    return p;
  });
  const vel = useRef({});
  const posRef = useRef(pos);
  useEffect(() => { posRef.current = pos; }, [pos]);

  useEffect(() => {
    colleges.forEach(c => { if (!vel.current[c.id]) vel.current[c.id] = {x:0,y:0}; });
    let tick = 0;
    let raf;
    const step = () => {
      tick++;
      const cool = Math.max(0.01, 1 - tick/250);
      const p = posRef.current;
      const v = vel.current;
      colleges.forEach(ci => {
        let fx = 0, fy = 0;
        colleges.forEach(cj => {
          if (ci.id === cj.id) return;
          const dx = p[ci.id].x - p[cj.id].x;
          const dy = p[ci.id].y - p[cj.id].y;
          const d = Math.hypot(dx,dy) + .1;
          // repulsion
          fx += (dx/d) * 3500 / (d*d);
          fy += (dy/d) * 3500 / (d*d);
          // spring attraction
          const vol = flows[ci.id][cj.id] + flows[cj.id][ci.id];
          if (vol > 0) {
            const ideal = Math.max(55, 200 - vol * 0.25);
            const att = (d - ideal) * 0.004 * Math.log(vol+1);
            fx -= (dx/d) * att;
            fy -= (dy/d) * att;
          }
        });
        fx -= p[ci.id].x * 0.012;
        fy -= p[ci.id].y * 0.012;
        v[ci.id].x = (v[ci.id].x + fx*0.1) * 0.72 * cool;
        v[ci.id].y = (v[ci.id].y + fy*0.1) * 0.72 * cool;
        p[ci.id] = { x: p[ci.id].x + v[ci.id].x, y: p[ci.id].y + v[ci.id].y };
      });
      if (tick % 4 === 0) setPos({...p});
      if (tick < 250) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return pos;
}

function ForceGraph({ colleges, flows, active, onToggle, hovered, onHover }) {
  const pos = useForce(colleges, flows);
  const maxVol = useMemo(() => Math.max(...flows.flat().filter(v=>v>0)), [flows]);
  const W = 320, H = 320, PAD = 44;

  const ids = colleges.map(c => c.id);
  const xs = ids.map(id => pos[id]?.x ?? 0);
  const ys = ids.map(id => pos[id]?.y ?? 0);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const sx = v => ((v-x0)/(x1-x0+.01))*(W-PAD*2)+PAD;
  const sy = v => ((v-y0)/(y1-y0+.01))*(H-PAD*2)+PAD;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"100%" }}>
      <defs>
        {COLORS.map((col,i) => (
          <marker key={i} id={`fa${i}`} viewBox="0 0 8 8" refX="7" refY="4"
            markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0 0 L8 4 L0 8z" fill={col}/>
          </marker>
        ))}
      </defs>

      {/* Edges */}
      {colleges.map((ci, k) =>
        colleges.map((cj, m) => {
          if (m <= k) return null;
          if (!active.has(ci.id) || !active.has(cj.id)) return null;
          const fwd = flows[ci.id][cj.id];
          const bwd = flows[cj.id][ci.id];
          if (fwd + bwd === 0) return null;
          const ax = sx(pos[ci.id]?.x??0), ay = sy(pos[ci.id]?.y??0);
          const bx2 = sx(pos[cj.id]?.x??0), by2 = sy(pos[cj.id]?.y??0);
          const mx = (ax+bx2)/2, my = (ay+by2)/2;
          const dx = bx2-ax, dy = by2-ay;
          const len = Math.hypot(dx,dy)+.01;
          const off = 13;
          const isHov = hovered && (hovered.k===k || hovered.k===m || hovered.m===k || hovered.m===m);
          const op = isHov ? 0.95 : 0.5;
          const wF = 1 + (fwd/maxVol)*5;
          const wB = 1 + (bwd/maxVol)*5;
          return (
            <g key={`e${k}-${m}`}
              onMouseEnter={() => onHover({k,m,ci,cj,fwd,bwd})}
              onMouseLeave={() => onHover(null)}
              style={{ cursor:"pointer" }}>
              <path d={`M${ax} ${ay} Q${mx-(dy/len)*off} ${my+(dx/len)*off} ${bx2} ${by2}`}
                fill="none" stroke={COLORS[k]} strokeWidth={wF} strokeOpacity={op}
                markerEnd={`url(#fa${k})`}/>
              <path d={`M${bx2} ${by2} Q${mx+(dy/len)*off} ${my-(dx/len)*off} ${ax} ${ay}`}
                fill="none" stroke={COLORS[m]} strokeWidth={wB} strokeOpacity={op}
                markerEnd={`url(#fa${m})`}/>
              {isHov && (
                <g pointerEvents="none">
                  <rect x={mx-32} y={my-22} width={64} height={42} rx={3}
                    fill="#0f172a" stroke={COLORS[k]} strokeWidth={0.6} opacity={0.96}/>
                  <text x={mx} y={my-10} textAnchor="middle" fontSize="8.5"
                    fill={COLORS[k]} fontFamily="monospace">{ci.short}→{cj.short}: <tspan fontWeight="700">{fwd}</tspan></text>
                  <text x={mx} y={my+4} textAnchor="middle" fontSize="8.5"
                    fill={COLORS[m]} fontFamily="monospace">{cj.short}→{ci.short}: <tspan fontWeight="700">{bwd}</tspan></text>
                </g>
              )}
            </g>
          );
        })
      )}

      {/* Nodes */}
      {colleges.map((c, k) => {
        const x = sx(pos[c.id]?.x??0), y = sy(pos[c.id]?.y??0);
        const isAct = active.has(c.id);
        const vol = colleges.reduce((s,cj)=> s + flows[c.id][cj.id] + flows[cj.id][c.id], 0);
        const r = 9 + (vol/800)*8;
        return (
          <g key={`n${k}`} onClick={() => onToggle(c.id)} style={{ cursor:"pointer" }}>
            {isAct && <circle cx={x} cy={y} r={r+5} fill={COLORS[k]} opacity={0.12}/>}
            <circle cx={x} cy={y} r={r}
              fill={isAct ? COLORS[k] : "#111827"}
              stroke={COLORS[k]} strokeWidth={isAct ? 0 : 1.5}
              opacity={isAct ? 1 : 0.25}/>
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fontWeight="700" fontFamily="monospace"
              fill={isAct ? "#030712" : "#2d3748"}>
              {c.short}
            </text>
            {isAct && (
              <text x={x} y={y+r+9} textAnchor="middle" fontSize="7"
                fontFamily="monospace" fill={COLORS[k]} opacity={0.75}>
                {c.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState(new Set(COLLEGES.map(c => c.id)));
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);

  const toggle = useCallback(id => {
    setActive(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const filtered = COLLEGES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background:"#030712", minHeight:"100vh", fontFamily:"'DM Mono','Courier New',monospace", color:"#e2e8f0", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"14px 22px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.2em", color:"#334155", textTransform:"uppercase" }}>CVC Exchange · Proof of Concept</div>
          <h1 style={{ fontSize:17, fontWeight:700, margin:"2px 0 0", letterSpacing:"-0.02em", background:"linear-gradient(90deg,#00d4ff,#f472b6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Bidirectional Enrollment Flow
          </h1>
        </div>
        <div style={{ fontSize:10, color:"#334155", textAlign:"right" }}>
          <span style={{ color:"#00d4ff" }}>{active.size}</span> / {COLLEGES.length} active
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

        {/* Sidebar */}
        <div style={{ width:180, borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", padding:"10px 0" }}>
          <div style={{ padding:"0 10px 8px" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search colleges..."
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:3, padding:"5px 9px", color:"#e2e8f0", fontSize:11, fontFamily:"'DM Mono',monospace", outline:"none" }}/>
          </div>
          <div style={{ display:"flex", gap:5, padding:"0 10px 8px" }}>
            {["All","None"].map(l => (
              <button key={l} onClick={() => setActive(l==="All" ? new Set(COLLEGES.map(c=>c.id)) : new Set())}
                style={{ flex:1, padding:"3px 0", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", borderRadius:2, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#475569" }}>{l}</button>
            ))}
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {filtered.map((c) => {
              const k = COLLEGES.findIndex(x => x.id === c.id);
              const isAct = active.has(c.id);
              return (
                <div key={c.id} onClick={() => toggle(c.id)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", cursor:"pointer", background:isAct?"rgba(255,255,255,0.03)":"transparent", borderLeft:`2px solid ${isAct?COLORS[k]:"transparent"}`, transition:"all 0.15s" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background:COLORS[k], opacity:isAct?1:0.2 }}/>
                  <div>
                    <div style={{ fontSize:11, color:isAct?"#e2e8f0":"#2d3748", lineHeight:1.25 }}>{c.name}</div>
                    <div style={{ fontSize:9, color:"#334155" }}>{c.district}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini matrix */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"10px 10px 4px" }}>
            <div style={{ fontSize:8, color:"#334155", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Flow Matrix</div>
            {COLLEGES.filter(ci => active.has(ci.id)).map((ci,i) =>
              COLLEGES.filter(cj => active.has(cj.id) && cj.id !== ci.id).map((cj,j) => {
                const k = COLLEGES.findIndex(x=>x.id===ci.id);
                const m = COLLEGES.findIndex(x=>x.id===cj.id);
                const fwd = FLOWS[ci.id][cj.id];
                if (fwd === 0) return null;
                return (
                  <div key={`${ci.id}-${cj.id}`} style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:9 }}>
                    <span><span style={{color:COLORS[k]}}>{ci.short}</span>→<span style={{color:COLORS[m]}}>{cj.short}</span></span>
                    <span style={{color:"#64748b", fontWeight:"700"}}>{fwd}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chord */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding:"8px 14px 5px", fontSize:8, letterSpacing:"0.15em", textTransform:"uppercase", color:"#2d3748", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            Chord — ribbon width = enrollment · hover for values
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:8 }}>
            <div style={{ width:"min(100%,360px)", aspectRatio:"1" }}>
              <ChordDiagram colleges={COLLEGES} flows={FLOWS} active={active} onToggle={toggle} hovered={hovered} onHover={setHovered}/>
            </div>
          </div>
        </div>

        {/* Force */}
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"8px 14px 5px", fontSize:8, letterSpacing:"0.15em", textTransform:"uppercase", color:"#2d3748", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            Force Graph — arc thickness = volume · dual arcs show asymmetry
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:8 }}>
            <div style={{ width:"min(100%,360px)", aspectRatio:"1" }}>
              <ForceGraph colleges={COLLEGES} flows={FLOWS} active={active} onToggle={toggle} hovered={hovered} onHover={setHovered}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
