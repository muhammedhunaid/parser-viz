import { LRAutomaton, LRItem } from "../utils/types";

type Props = {
  automaton: LRAutomaton | null;
  selectedStateId: number | null;
};

const formatItem = (item: LRItem) => {
  const rhs = item.production.rhs[item.altIndex] ?? [];
  const symbols = [...rhs];
  symbols.splice(item.dot, 0, "•");
  return `${item.production.lhs} → ${symbols.join(" ") || "•"}`;
};

export default function LRStateInspector({ automaton, selectedStateId }: Props) {
  if (!automaton || automaton.states.length === 0) return null;

  const state =
    automaton.states.find((candidate) => candidate.id === selectedStateId) ?? automaton.states[0];

  return (
    <div className="panel fade-in">
      <h2>LR State Inspector</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="hint">Selected State</div>
        <div>q{state.id}</div>
      </div>
      <div className="card">
        <div className="hint">Items</div>
        <div style={{ display: "grid", gap: 6 }}>
          {state.items.map((item, idx) => (
            <div key={`${state.id}-${idx}`}>{formatItem(item)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
