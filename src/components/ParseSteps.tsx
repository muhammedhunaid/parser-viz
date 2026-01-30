import { ParseStep } from "../utils/types";

type Props = {
  steps: ParseStep[];
  activeIndex: number;
  isPlaying: boolean;
  summary?: string;
  onNext: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
};

export default function ParseSteps({
  steps,
  activeIndex,
  isPlaying,
  summary,
  onNext,
  onPrev,
  onTogglePlay,
}: Props) {
  return (
    <div className="panel fade-in">
      <h2>Parse Timeline</h2>
      {summary && <div className="hint" style={{ marginBottom: 10 }}>{summary}</div>}
      {steps.length === 0 ? (
        <div className="hint">Run a parse to see steps.</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <button className="button secondary" onClick={onPrev} type="button">
              Prev
            </button>
            <button className="button secondary" onClick={onTogglePlay} type="button">
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button className="button secondary" onClick={onNext} type="button">
              Next
            </button>
            <div className="hint">
              Step {Math.min(activeIndex + 1, steps.length)} / {steps.length}
            </div>
          </div>
          <div className="steps">
            {steps.map((step) => (
              <div
                key={step.index}
                className={`step ${step.index === activeIndex ? "active" : ""}`}
              >
                <div className="hint">Stack</div>
                <div>{step.stack}</div>
                <div className="hint" style={{ marginTop: 6 }}>
                  Input
                </div>
                <div>{step.input}</div>
                <div className="hint" style={{ marginTop: 6 }}>
                  Action
                </div>
                <div>{step.action}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
