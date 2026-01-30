import { Grammar, ParseStep } from "./types";
import { buildLL1Table } from "./ll1Parser";
import { buildLRAutomaton } from "./lrParser";

export type ParserType = "ll1" | "lr0" | "slr1" | "lr1";

export function tokenizeInput(input: string): string[] {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function buildArtifacts(grammar: Grammar, parserType: ParserType) {
  if (parserType === "ll1") {
    return {
      table: buildLL1Table(grammar),
      automaton: null,
    };
  }

  return {
    table: null,
    automaton: buildLRAutomaton(grammar),
  };
}

export function buildDemoSteps(inputTokens: string[], parserType: ParserType): ParseStep[] {
  const steps: ParseStep[] = [];
  const tokens = [...inputTokens, "$"];

  steps.push({
    index: 0,
    stack: "$ 0",
    input: tokens.join(" "),
    action: `Initialize ${parserType.toUpperCase()} parse`,
  });

  tokens.slice(0, Math.min(tokens.length, 5)).forEach((token, idx) => {
    steps.push({
      index: idx + 1,
      stack: `$ 0 ${token} ${idx + 1}`,
      input: tokens.slice(idx + 1).join(" "),
      action: `Shift ${token}`,
    });
  });

  steps.push({
    index: steps.length,
    stack: `$ 0 E 1`,
    input: "$",
    action: "Accept (demo)",
  });

  return steps;
}
