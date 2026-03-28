import { useState, useEffect, useRef, useCallback } from "react";

const COLLEGES = [
  { id: "arc", name: "American River College", city: "Sacramento", x: 52, y: 22, district: "Los Rios" },
  { id: "scc", name: "Sacramento City College", city: "Sacramento", x: 50, y: 24, district: "Los Rios" },
  { id: "flc", name: "Folsom Lake College", city: "Folsom", x: 55, y: 23, district: "Los Rios" },
  { id: "crc", name: "Cosumnes River College", city: "Sacramento", x: 51, y: 26, district: "Los Rios" },
  { id: "sierra", name: "Sierra College", city: "Rocklin", x: 54, y: 20, district: "Sierra" },
  { id: "dvc", name: "Diablo Valley College", city: "Pleasant Hill", x: 36, y: 35, district: "Contra Costa" },
  { id: "laney", name: "Laney College", city: "Oakland", x: 34, y: 37, district: "Peralta" },
  { id: "merritt", name: "Merritt College", city: "Oakland", x: 34, y: 38, district: "Peralta" },
  { id: "bcc", name: "Berkeley City College", city: "Berkeley", x: 33, y: 36, district: "Peralta" },
  { id: "foothill", name: "Foothill College", city: "Los Altos Hills", x: 32, y: 42, district: "Foothill-DeAnza" },
  { id: "deanza", name: "DeAnza College", city: "Cupertino", x: 31, y: 43, district: "Foothill-DeAnza" },
  { id: "sjcc", name: "San Jose City College", city: "San Jose", x: 32, y: 44, district: "San Jose-Evergreen" },
  { id: "evc", name: "Evergreen Valley College", city: "San Jose", x: 33, y: 45, district: "San Jose-Evergreen" },
  { id: "fresno", name: "Fresno City College", city: "Fresno", x: 50, y: 52, district: "State Center" },
  { id: "reedley", name: "Reedley College", city: "Reedley", x: 53, y: 54, district: "State Center" },
  { id: "clovis", name: "Clovis Community College", city: "Fresno", x: 51, y: 50, district: "State Center" },
  { id: "lacitycollege", name: "LA City College", city: "Los Angeles", x: 38, y: 72, district: "LACCD" },
  { id: "elac", name: "East LA College", city: "Monterey Park", x: 41, y: 73, district: "LACCD" },
  { id: "lavalley", name: "LA Valley College", city: "Valley Glen", x: 37, y: 70, district: "LACCD" },
  { id: "pierce", name: "LA Pierce College", city: "Woodland Hills", x: 35, y: 71, district: "LACCD" },
  { id: "lattc", name: "LA Trade-Tech", city: "Los Angeles", x: 38, y: 74, district: "LACCD" },
  { id: "lasc", name: "LA Southwest College", city: "Los Angeles", x: 38, y: 75, district: "LACCD" },
  { id: "elcamino", name: "El Camino College", city: "Torrance", x: 37, y: 77, district: "El Camino" },
  { id: "lbcc", name: "Long Beach City College", city: "Long Beach", x: 40, y: 78, district: "Long Beach" },
  { id: "fullerton", name: "Fullerton College", city: "Fullerton", x: 44, y: 76, district: "N. Orange County" },
  { id: "cypress", name: "Cypress College", city: "Cypress", x: 43, y: 77, district: "N. Orange County" },
  { id: "rcc", name: "Riverside City College", city: "Riverside", x: 48, y: 76, district: "Riverside" },
  { id: "norco", name: "Norco College", city: "Norco", x: 47, y: 75, district: "Riverside" },
  { id: "mvc", name: "Moreno Valley College", city: "Moreno Valley", x: 49, y: 77, district: "Riverside" },
  { id: "sdcity", name: "SD City College", city: "San Diego", x: 44, y: 88, district: "San Diego" },
  { id: "sdmesa", name: "SD Mesa College", city: "San Diego", x: 43, y: 87, district: "San Diego" },
  { id: "sdmiramar", name: "SD Miramar College", city: "San Diego", x: 44, y: 85, district: "San Diego" },
  { id: "swc", name: "Southwestern College", city: "Chula Vista", x: 44, y: 91, district: "Southwestern" },
  { id: "palomar", name: "Palomar College", city: "San Marcos", x: 43, y: 83, district: "Palomar" },
];

const FLOWS = [
  { from: "arc", to: "scc", volume: 1240, type: "transfer" },
  { from: "arc", to: "sierra", volume: 890, type: "transfer" },
  { from: "arc", to: "flc", volume: 760, type: "shared_program" },
  { from: "scc", to: "crc", volume: 980, type: "transfer" },
  { from: "flc", to: "sierra", volume: 540, type: "shared_program" },
  { from: "dvc", to: "laney", volume: 430, type: "transfer" },
  { from: "bcc", to: "laney", volume: 610, type: "transfer" },
  { from: "merritt", to: "laney", volume: 520, type: "shared_program" },
  { from: "foothill", to: "deanza", volume: 1100, type: "shared_program" },
  { from: "deanza", to: "sjcc", volume: 670, type: "transfer" },
  { from: "sjcc", to: "evc", volume: 480, type: "shared_program" },
  { from: "fresno", to: "reedley", volume: 720, type: "transfer" },
  { from: "fresno", to: "clovis", volume: 850, type: "shared_program" },
  { from: "clovis", to: "reedley", volume: 390, type: "transfer" },
  { from: "lacitycollege", to: "elac", volume: 1380, type: "transfer" },
  { from: "lavalley", to: "pierce", volume: 760, type: "shared_program" },
  { from: "lacitycollege", to: "lattc", volume: 920, type: "shared_program" },
  { from: "lasc", to: "elcamino", volume: 580, type: "transfer" },
  { from: "elcamino", to: "lbcc", volume: 840, type: "transfer" },
  { from: "fullerton", to: "cypress", volume: 1050, type: "shared_program" },
  { from: "rcc", to: "norco", volume: 910, type: "shared_program" },
  { from: "rcc", to: "mvc", volume: 730, type: "transfer" },
  { from: "norco", to: "mvc", volume: 490, type: "transfer" },
  { from: "sdcity", to: "sdmesa", volume: 1200, type: "transfer" },
  { from: "sdmesa", to: "sdmiramar", volume: 670, type: "shared_program" },
  { from: "sdcity", to: "swc", volume: 540, type: "transfer" },
  { from: "sdmiramar", to: "palomar", volume: 380, type: "transfer" },
  { from: "fullerton", to: "rcc", volume: 620, type: "transfer" },
  { from: "lbcc", to: "sdmesa", volume: 410, type: "transfer" },
  { from: "arc", to: "fresno", volume: 290, type: "transfer" },
  { from: "deanza", to: "fresno", volume: 330, type: "transfer" },
  { from: "laney", to: "sjcc", volume: 460, type: "transfer" },
];

const DISTRICT_COLORS = {
  "Los Rios": "#00d4ff",
  "Sierra": "#7dd3fc",
  "Contra Costa": "#34d399",
  "Peralta": "#6ee7b7",
  "Foothill-DeAnza": "#fbbf24",
  "San Jose-Evergreen": "#f59e0b",
  "State Center": "#f472b6",
  "LACCD": "#fb923c",
  "El Camino": "#ff6b6b",
  "Long Beach": "#ff8c8c",
  "N. Orange County": "#c084fc",
  "Riverside": "#a78bfa",
  "San Diego": "#60a5fa",
  "Southwestern": "#38bdf8",
  "Palomar": "#7dd3fc",
};

const TYPE_COLORS = {
  transfer: "#00d4ff",
  shared_program: "#f472b6",
};

export default function EnrollmentFlowMap() {
  const svgRef = useRef(null);
  const [hoveredCollege, setHoveredCollege] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [animFrame, setAnimFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimFrame(f => (f + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const activeCollege = selectedCollege || hoveredCollege;

  const visibleFlows = FLOWS.filter(f => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (activeCollege) {
      return f.from === activeCollege || f.to === activeCollege;
    }
    return true;
  });

  const maxVolume = Math.max(...FLOWS.map(f => f.volume));

  const getPos = (college) => ({
    x: (college.x / 100) * 100,
    y: (college.y / 100) * 100,
  });

  const getCurvedPath = (from, to) => {
    const f = getPos(from);
    const t = getPos(to);
    const mx = (f.x + t.x) / 2;
    const my = (f.y + t.y) / 2;
    const dx = t.x - f.x;
    const dy = t.y - f.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const cx = mx - (dy / len) * len * 0.25;
    const cy = my + (dx / len) * len * 0.25;
    return `M ${f.x} ${f.y} Q ${cx} ${cy} ${t.x} ${t.y}`;
  };

  const getCollegeFlows = (id) => {
    return FLOWS.filter(f => f.from === id || f.to === id);
  };

  const totalVolume = (id) => {
    return getCollegeFlows(id).reduce((sum, f) => sum + f.volume, 0);
  };

  return (
    <div style={{
      background: "#030712",
      minHeight: "100vh",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Noise texture overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "20px 28px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#475569", marginBottom: 4, textTransform: "uppercase" }}>
            California Community Colleges — CVC Exchange
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #00d4ff, #f472b6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Enrollment Flow Network
          </h1>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>
            Mock data · {COLLEGES.length} colleges · {FLOWS.length} connections
          </div>
        </div>

        {/* Filter + Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "transfer", "shared_program"].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding: "4px 12px", fontSize: 10, letterSpacing: "0.1em",
                borderRadius: 2, cursor: "pointer", textTransform: "uppercase",
                border: filterType === t ? "1px solid #00d4ff" : "1px solid #1e293b",
                background: filterType === t ? "rgba(0,212,255,0.12)" : "transparent",
                color: filterType === t ? "#00d4ff" : "#475569",
                transition: "all 0.2s",
              }}>
                {t === "shared_program" ? "Shared Program" : t}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <div style={{ width: 20, height: 2, background: color, borderRadius: 1 }} />
                {type.replace("_", " ")}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 90px)", position: "relative", zIndex: 1 }}>

        {/* MAP AREA */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg
            ref={svgRef}
            viewBox="20 15 40 82"
            style={{ width: "100%", height: "100%" }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <marker key={type} id={`arrow-${type}`} viewBox="0 0 6 6" refX="3" refY="3"
                  markerWidth="3" markerHeight="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill={color} opacity="0.7" />
                </marker>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="node-glow">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* CA state rough outline hint */}
            <path d="M 28 16 L 38 15 L 65 20 L 68 35 L 60 55 L 58 70 L 52 82 L 46 93 L 42 93 L 35 88 L 28 78 L 22 60 L 21 40 Z"
              fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />

            {/* Flow arcs */}
            {visibleFlows.map((flow, i) => {
              const fromC = COLLEGES.find(c => c.id === flow.from);
              const toC = COLLEGES.find(c => c.id === flow.to);
              if (!fromC || !toC) return null;
              const path = getCurvedPath(fromC, toC);
              const weight = (flow.volume / maxVolume);
              const strokeW = 0.08 + weight * 0.35;
              const color = TYPE_COLORS[flow.type];
              const isHighlighted = activeCollege && (flow.from === activeCollege || flow.to === activeCollege);
              const opacity = activeCollege ? (isHighlighted ? 0.9 : 0.05) : 0.35;

              return (
                <g key={i}>
                  {/* Glow layer */}
                  <path d={path} fill="none"
                    stroke={color} strokeWidth={strokeW * 3}
                    opacity={opacity * 0.15}
                    strokeLinecap="round"
                  />
                  {/* Main arc */}
                  <path d={path} fill="none"
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={opacity}
                    strokeLinecap="round"
                    markerEnd={`url(#arrow-${flow.type})`}
                    filter={isHighlighted ? "url(#glow)" : "none"}
                  />
                  {/* Animated pulse dot */}
                  {isHighlighted && (
                    <circle r="0.25" fill={color} opacity="0.9">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* College nodes */}
            {COLLEGES.map(college => {
              const pos = getPos(college);
              const color = DISTRICT_COLORS[college.district] || "#94a3b8";
              const isActive = activeCollege === college.id;
              const hasFlow = activeCollege ? getCollegeFlows(college.id).some(
                f => f.from === activeCollege || f.to === activeCollege || f.from === college.id || f.to === college.id
              ) : true;
              const vol = totalVolume(college.id);
              const nodeSize = 0.3 + (vol / 8000) * 0.5;

              return (
                <g key={college.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedCollege(s => s === college.id ? null : college.id)}
                  onMouseEnter={() => setHoveredCollege(college.id)}
                  onMouseLeave={() => setHoveredCollege(null)}
                >
                  {/* Outer ring for active */}
                  {isActive && (
                    <circle cx={pos.x} cy={pos.y} r={nodeSize + 0.6}
                      fill="none" stroke={color} strokeWidth="0.12" opacity="0.5">
                      <animate attributeName="r" values={`${nodeSize + 0.4};${nodeSize + 1};${nodeSize + 0.4}`}
                        dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Glow */}
                  <circle cx={pos.x} cy={pos.y} r={nodeSize + 0.2}
                    fill={color} opacity={isActive ? 0.25 : hasFlow ? 0.1 : 0.03} />
                  {/* Node */}
                  <circle cx={pos.x} cy={pos.y} r={nodeSize}
                    fill={isActive ? color : "rgba(3,7,18,0.8)"}
                    stroke={color}
                    strokeWidth={isActive ? 0 : 0.12}
                    opacity={activeCollege && !isActive && !hasFlow ? 0.2 : 1}
                    filter={isActive ? "url(#node-glow)" : "none"}
                  />
                  {/* Label */}
                  {(isActive || (!activeCollege && nodeSize > 0.45)) && (
                    <text x={pos.x} y={pos.y - nodeSize - 0.3}
                      textAnchor="middle" fontSize="0.6"
                      fill={color} opacity="0.9"
                      style={{ pointerEvents: "none", fontFamily: "'DM Mono', monospace" }}>
                      {college.city}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Click hint */}
          {!activeCollege && (
            <div style={{
              position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
              fontSize: 10, color: "#334155", letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              click a node to explore connections
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{
          width: 240, borderLeft: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 14px", display: "flex", flexDirection: "column", gap: 16,
          overflowY: "auto",
        }}>
          {activeCollege ? (() => {
            const college = COLLEGES.find(c => c.id === activeCollege);
            const flows = getCollegeFlows(activeCollege);
            const outgoing = flows.filter(f => f.from === activeCollege);
            const incoming = flows.filter(f => f.to === activeCollege);
            const color = DISTRICT_COLORS[college.district] || "#94a3b8";

            return (
              <>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                    Selected
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3, marginBottom: 2 }}>
                    {college.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{college.district} District</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Total Flow", val: totalVolume(activeCollege).toLocaleString() },
                    { label: "Connections", val: flows.length },
                    { label: "Outgoing", val: outgoing.length },
                    { label: "Incoming", val: incoming.length },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 4, padding: "8px 10px",
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}</div>
                      <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {outgoing.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#00d4ff", textTransform: "uppercase", marginBottom: 8 }}>
                      ↗ Outgoing Flows
                    </div>
                    {outgoing.sort((a, b) => b.volume - a.volume).map(f => {
                      const target = COLLEGES.find(c => c.id === f.to);
                      return (
                        <div key={f.to} style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                            <span style={{ color: "#cbd5e1" }}>{target?.city}</span>
                            <span style={{ color: TYPE_COLORS[f.type] }}>{f.volume.toLocaleString()}</span>
                          </div>
                          <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                            <div style={{
                              height: "100%", borderRadius: 1,
                              width: `${(f.volume / maxVolume) * 100}%`,
                              background: TYPE_COLORS[f.type],
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {incoming.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#f472b6", textTransform: "uppercase", marginBottom: 8 }}>
                      ↙ Incoming Flows
                    </div>
                    {incoming.sort((a, b) => b.volume - a.volume).map(f => {
                      const source = COLLEGES.find(c => c.id === f.from);
                      return (
                        <div key={f.from} style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                            <span style={{ color: "#cbd5e1" }}>{source?.city}</span>
                            <span style={{ color: TYPE_COLORS[f.type] }}>{f.volume.toLocaleString()}</span>
                          </div>
                          <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                            <div style={{
                              height: "100%", borderRadius: 1,
                              width: `${(f.volume / maxVolume) * 100}%`,
                              background: TYPE_COLORS[f.type],
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button onClick={() => setSelectedCollege(null)} style={{
                  marginTop: "auto", padding: "8px", fontSize: 10, letterSpacing: "0.1em",
                  textTransform: "uppercase", background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#475569",
                  borderRadius: 2, cursor: "pointer",
                }}>
                  Clear Selection
                </button>
              </>
            );
          })() : (
            <>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>
                  Districts
                </div>
                {Object.entries(DISTRICT_COLORS).map(([district, color]) => (
                  <div key={district} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "#64748b" }}>{district}</span>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>
                  Top Connections
                </div>
                {FLOWS.sort((a, b) => b.volume - a.volume).slice(0, 8).map((f, i) => {
                  const from = COLLEGES.find(c => c.id === f.from);
                  const to = COLLEGES.find(c => c.id === f.to);
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}>
                        <span style={{ color: "#94a3b8" }}>{from?.city} → {to?.city}</span>
                        <span style={{ color: TYPE_COLORS[f.type], fontWeight: 700 }}>{f.volume.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 1.5, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                        <div style={{
                          height: "100%", borderRadius: 1,
                          width: `${(f.volume / maxVolume) * 100}%`,
                          background: TYPE_COLORS[f.type], opacity: 0.7,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
