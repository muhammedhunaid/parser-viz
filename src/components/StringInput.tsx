import { useMemo } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  tokens: string[];
  presets: string[];
  onPickPreset: (value: string) => void;
};

export default function StringInput({ value, onChange, tokens, presets, onPickPreset }: Props) {
  const preview = useMemo(() => tokens.join(" "), [tokens]);

  return (
    <div className="panel fade-in">
      <h2>Input Stream</h2>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="id + id * id"
      />
      <div className="hint" style={{ marginTop: 8 }}>
        Tokens: {preview || "(empty)"}
      </div>
      <h3>Presets</h3>
      <div className="chips">
        {presets.map((preset) => (
          <button key={preset} className="chip" onClick={() => onPickPreset(preset)} type="button">
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
