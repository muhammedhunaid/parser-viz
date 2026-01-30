import { describe, expect, it } from "vitest";
import { parseGrammar } from "./grammarParser";
import { buildLL1Table } from "./ll1Parser";
import { buildLL1Trace } from "./ll1Trace";

const grammarText = `S -> A B
A -> a | epsilon
B -> b`;

describe("ll1Trace", () => {
  it("accepts valid input", () => {
    const grammar = parseGrammar(grammarText);
    const table = buildLL1Table(grammar);
    const trace = buildLL1Trace(grammar, table, ["a", "b"]);
    expect(trace.accepted).toBe(true);
    expect(trace.steps.at(-1)?.action).toBe("Accept");
  });

  it("rejects invalid input with error", () => {
    const grammar = parseGrammar(grammarText);
    const table = buildLL1Table(grammar);
    const trace = buildLL1Trace(grammar, table, ["a", "a"]);
    expect(trace.accepted).toBe(false);
    expect(trace.error).toBeDefined();
  });
});
