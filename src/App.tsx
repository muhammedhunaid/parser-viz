import { useEffect, useMemo, useState } from "react";
import ExportButton from "./components/ExportButton";
import GrammarInput from "./components/GrammarInput";
import LRAutomatonView from "./components/LRAutomaton";
import ParseSteps from "./components/ParseSteps";
import ParseTree from "./components/ParseTree";
import ParsingTableView from "./components/ParsingTable";
import ParserSelector from "./components/ParserSelector";
import StringInput from "./components/StringInput";
import { parseGrammar, validateGrammar } from "./utils/grammarParser";
import { LRAutomaton, ParseStep, ParsingTable } from "./utils/types";
import { buildArtifacts, buildDemoSteps, ParserType, tokenizeInput } from "./utils/viewModel";

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

const grammarPresets = [
  {
    name: "Classic Expression",
    grammar: `S -> E\nE -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`,
    input: "id + id * id",
  },
  {
    name: "Balanced Parens",
    grammar: `S -> ( S ) S | epsilon`,
    input: "( ( ) )",
  },
  {
    name: "Tiny If",
    grammar: `S -> if E then S else S | id\nE -> id`,
    input: "if id then id else id",
  },
];

export default function App() {
  const [grammarText, setGrammarText] = useState(grammarPresets[0].grammar);
  const [inputText, setInputText] = useState(grammarPresets[0].input);
  const [parserType, setParserType] = useState<ParserType>("ll1");
  const [table, setTable] = useState<ParsingTable | null>(null);
  const [automaton, setAutomaton] = useState<LRAutomaton | null>(null);
  const [steps, setSteps] = useState<ParseStep[]>([]);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTree, setShowTree] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [showAutomaton, setShowAutomaton] = useState(true);

  const tokens = useMemo(() => tokenizeInput(inputText), [inputText]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1 >= steps.length ? 0 : prev + 1));
    }, 900);

    return () => window.clearInterval(timer);
  }, [isPlaying, steps.length]);

  const onParse = () => {
    try {
      const grammar = parseGrammar(grammarText);
      const validation = validateGrammar(grammar);
      if (validation.errors.length > 0) {
        return;
      }

      const artifacts = buildArtifacts(grammar, parserType);
      setTable(artifacts.table as ParsingTable | null);
      setAutomaton(artifacts.automaton as LRAutomaton | null);
      const demoSteps = buildDemoSteps(tokens, parserType);
      setSteps(demoSteps);
      setActiveStep(0);
      setTree(buildDemoTree(grammar.startSymbol, tokens));
    } catch (error) {
      setSteps([]);
    }
  };

  const onPreset = (index: number) => {
    const preset = grammarPresets[index];
    setGrammarText(preset.grammar);
    setInputText(preset.input);
  };

  const validationReport = useMemo(() => {
    try {
      const grammar = parseGrammar(grammarText);
      return validateGrammar(grammar);
    } catch (error) {
      return { errors: [error instanceof Error ? error.message : String(error)], warnings: [] };
    }
  }, [grammarText]);

  return (
    <div className="app">
      <section className="hero">
        <div>
          <h1>Parser Viz Studio</h1>
          <p>
            Explore LL(1), LR(0), SLR(1), and LR(1) workflows with live validation, automated tables, and an interactive
            LR automaton. Designed for rapid experimentation without leaving the browser.
          </p>
        </div>
        <div className="badges">
          <div className="badge">Grammar validation</div>
          <div className="badge">LL(1) table export</div>
          <div className="badge">LR automaton preview</div>
          <div className="badge">Playback timeline</div>
        </div>
      </section>

      <div className="layout">
        <div style={{ display: "grid", gap: 18 }}>
          <GrammarInput value={grammarText} report={validationReport} onChange={setGrammarText} />
          <div className="panel fade-in">
            <h2>Quick Presets</h2>
            <div className="chips">
              {grammarPresets.map((preset, index) => (
                <button key={preset.name} className="chip" onClick={() => onPreset(index)} type="button">
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <StringInput
            value={inputText}
            onChange={setInputText}
            tokens={tokens}
            presets={grammarPresets.map((preset) => preset.input)}
            onPickPreset={setInputText}
          />
          <ParserSelector value={parserType} onChange={setParserType} />
          <div className="panel fade-in">
            <h2>Output Views</h2>
            <div className="chips">
              <button
                className={`chip ${showTable ? "active" : ""}`}
                type="button"
                onClick={() => setShowTable((prev) => !prev)}
              >
                Table
              </button>
              <button
                className={`chip ${showAutomaton ? "active" : ""}`}
                type="button"
                onClick={() => setShowAutomaton((prev) => !prev)}
              >
                Automaton
              </button>
              <button
                className={`chip ${showTree ? "active" : ""}`}
                type="button"
                onClick={() => setShowTree((prev) => !prev)}
              >
                Tree
              </button>
            </div>
          </div>
          <div className="panel fade-in">
            <h2>Actions</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <button className="button" onClick={onParse} disabled={validationReport.errors.length > 0} type="button">
                Build Parse Artifacts
              </button>
              <ExportButton steps={steps} table={table} automaton={automaton} />
              {validationReport.errors.length > 0 && (
                <div className="error-text">Fix validation errors to run the parser.</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid-panels">
          {showTable && table && <ParsingTableView table={table} />}
          {showAutomaton && automaton && <LRAutomatonView automaton={automaton} />}
          <ParseSteps
            steps={steps}
            activeIndex={activeStep}
            isPlaying={isPlaying}
            onNext={() => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))}
            onPrev={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
          />
          {showTree && <ParseTree tree={tree} />}
        </div>
      </div>
    </div>
  );
}

function buildDemoTree(start: string, tokens: string[]): TreeNode {
  const leaves = tokens.length > 0 ? tokens : ["epsilon"];
  return {
    id: `node-${start}-0`,
    label: start,
    children: leaves.map((token, index) => ({ id: `leaf-${index}`, label: token })),
  };
}
