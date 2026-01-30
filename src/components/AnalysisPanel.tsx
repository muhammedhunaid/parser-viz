import { AnalysisReport } from "../utils/types";

type Props = {
  report: AnalysisReport;
};

const formatSet = (set?: Set<string>) => {
  if (!set || set.size === 0) return "∅";
  return `{ ${[...set].sort().join(", ")} }`;
};

export default function AnalysisPanel({ report }: Props) {
  return (
    <div className="panel fade-in">
      <h2>Grammar Analysis</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="hint">Nullable Nonterminals</div>
        <div>{report.nullable.length > 0 ? [...report.nullable].sort().join(", ") : "None"}</div>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="hint">FIRST Sets</div>
        <div style={{ display: "grid", gap: 8 }}>
          {[...report.first.entries()].map(([nt, set]) => (
            <div key={`first-${nt}`}>
              <strong>{nt}</strong>: {formatSet(set)}
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="hint">FOLLOW Sets</div>
        <div style={{ display: "grid", gap: 8 }}>
          {[...report.follow.entries()].map(([nt, set]) => (
            <div key={`follow-${nt}`}>
              <strong>{nt}</strong>: {formatSet(set)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
