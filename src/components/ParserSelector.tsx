import { ParserType } from "../utils/viewModel";

type Props = {
  value: ParserType;
  onChange: (value: ParserType) => void;
};

const options: { value: ParserType; label: string; detail: string }[] = [
  { value: "ll1", label: "LL(1)", detail: "Predictive table" },
  { value: "lr0", label: "LR(0)", detail: "Core LR automaton" },
  { value: "slr1", label: "SLR(1)", detail: "LR(0) + Follow" },
  { value: "lr1", label: "LR(1)", detail: "Lookahead items" },
];

export default function ParserSelector({ value, onChange }: Props) {
  return (
    <div className="panel fade-in">
      <h2>Parser Toggle</h2>
      <div className="chips">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`chip ${value === opt.value ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            <div>
              <div>{opt.label}</div>
              <div className="hint">{opt.detail}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
