import { describe, expect, it } from "vitest";
import {
  buildAnalysisReport,
  getFirstSets,
  getFollowSets,
  parseGrammar,
  validateGrammar,
} from "./grammarParser";

const expressionGrammar = `S -> E
E -> E + T | T
T -> T * F | F
F -> ( E ) | id`;

const nullableGrammar = `S -> A
A -> epsilon`;

const toArray = (set: Set<string>) => [...set].sort();

describe("grammarParser", () => {
  it("parses a grammar and identifies terminals/nonterminals", () => {
    const grammar = parseGrammar(expressionGrammar);
    expect(grammar.startSymbol).toBe("S");
    expect(grammar.nonterminals.has("E")).toBe(true);
    expect(grammar.terminals.has("id")).toBe(true);
    expect(grammar.terminals.has("+")).toBe(true);
  });

  it("computes FIRST and FOLLOW sets", () => {
    const grammar = parseGrammar(expressionGrammar);
    const first = getFirstSets(grammar);
    const follow = getFollowSets(grammar, first);
    expect(toArray(first.get("F")!)).toEqual(["(", "id"]);
    expect(toArray(follow.get("E")!)).toEqual(["$", ")", "+"]);
  });

  it("detects nullable nonterminals in analysis report", () => {
    const grammar = parseGrammar(nullableGrammar);
    const report = buildAnalysisReport(grammar);
    expect(report.nullable.sort()).toEqual(["A", "S"]);
  });

  it("flags undefined nonterminals", () => {
    const grammar = parseGrammar("S -> A");
    const report = validateGrammar(grammar);
    expect(report.errors[0]).toContain("Undefined nonterminals");
  });
});
