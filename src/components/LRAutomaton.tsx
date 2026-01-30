import { useMemo } from "react";
import { LRAutomaton } from "../utils/types";

type Props = {
  automaton: LRAutomaton;
  selectedStateId?: number | null;
  onSelectState?: (stateId: number) => void;
};

const size = 560;

export default function LRAutomatonView({ automaton, selectedStateId, onSelectState }: Props) {
  const positions = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    const count = automaton.states.length || 1;
    const radius = 210;
    automaton.states.forEach((state, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      map.set(state.id, {
        x: size / 2 + radius * Math.cos(angle),
        y: size / 2 + radius * Math.sin(angle),
      });
    });
    return map;
  }, [automaton.states]);

  return (
    <div className="panel fade-in">
      <h2>LR Automaton</h2>
      <svg className="tree" viewBox={`0 0 ${size} ${size}`} style={{ height: 420 }}>
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="rgba(255, 255, 255, 0.6)" />
          </marker>
        </defs>
        {automaton.edges.map((edge, idx) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={`${edge.from}-${edge.to}-${idx}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255, 255, 255, 0.4)"
                markerEnd="url(#arrow)"
              />
              <text x={midX} y={midY - 6} fill="#cbd5f5" fontSize={11} textAnchor="middle">
                {edge.symbol}
              </text>
            </g>
          );
        })}
        {automaton.states.map((state) => {
          const pos = positions.get(state.id);
          if (!pos) return null;
          const isActive = selectedStateId === state.id;
          return (
            <g key={state.id} onClick={() => onSelectState?.(state.id)} style={{ cursor: "pointer" }}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={isActive ? "rgba(124, 255, 166, 0.95)" : "rgba(124, 240, 255, 0.9)"}
              />
              <text x={pos.x} y={pos.y + 4} fontSize={12} textAnchor="middle" fill="#0b0f14">
                q{state.id}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="hint">LR(0) core items; SLR/LR(1) reuse the same graph here.</div>
    </div>
  );
}
