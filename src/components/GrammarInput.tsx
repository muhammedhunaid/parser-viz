import { useMemo } from "react";
import { ValidationReport } from "../utils/types";

type Props = {
  value: string;
  report: ValidationReport;
  onChange: (value: string) => void;
};

export default function GrammarInput({ value, report, onChange }: Props) {
  const error = report.errors[0];
  const warnings = useMemo(() => report.warnings, [report.warnings]);

  return (
    <div className="panel fade-in">
      <h2>Grammar Studio</h2>
      <textarea
        className={`input ${error ? "error" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`S -> E\nE -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`}
      />
      <div className="hint" style={{ marginTop: 8 }}>
        One production per line. Use epsilon as "epsilon".
      </div>
      {error && <div className="error-text">{error}</div>}
      {warnings.length > 0 && (
        <div className="hint" style={{ marginTop: 8 }}>
          Warnings: {warnings.join(" ")}
        </div>
      )}
    </div>
  );
}
