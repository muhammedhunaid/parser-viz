import { describe, expect, it } from "vitest";
import { parseGrammar } from "./grammarParser";
import { buildLL1Table } from "./ll1Parser";

const grammarText = `S -> A B
A -> a | epsilon
B -> b`;

describe("ll1Parser", () => {
  it("builds an LL(1) table with correct entries", () => {
    const grammar = parseGrammar(grammarText);
    const table = buildLL1Table(grammar);
    const rowA = table.table.get("A");
    const rowS = table.table.get("S");

    expect(rowA?.get("a")).toBe("A -> a");
    expect(rowA?.get("b")).toBe("A -> epsilon");
    expect(rowS?.get("a")).toBe("S -> A B");
    expect(rowS?.get("b")).toBe("S -> A B");
    expect(table.conflicts.length).toBe(0);
  });
});
