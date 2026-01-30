import { LRAutomaton, ParseStep, ParsingTable } from "../utils/types";

const download = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

type Props = {
  steps: ParseStep[];
  table: ParsingTable | null;
  automaton: LRAutomaton | null;
};

export default function ExportButton({ steps, table, automaton }: Props) {
  const payload = {
    steps,
    table,
    automaton,
  };

  const csv = [
    ["Step", "Stack", "Input", "Action"],
    ...steps.map((step) => [step.index, step.stack, step.input, step.action]),
  ]
    .map((row) => row.map((cell) => `"${String(cell)}"`).join(","))
    .join("\n");

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        className="button secondary"
        type="button"
        onClick={() => download(JSON.stringify(payload, null, 2), "parser-viz.json", "application/json")}
      >
        Export JSON
      </button>
      <button
        className="button secondary"
        type="button"
        onClick={() => download(csv, "parser-steps.csv", "text/csv")}
      >
        Export Steps CSV
      </button>
    </div>
  );
}
