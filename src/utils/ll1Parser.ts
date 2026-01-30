import { Grammar, ParsingTable } from "./types";
import { firstOfSequence, getFirstSets, getFollowSets } from "./grammarParser";

export function buildLL1Table(grammar: Grammar): ParsingTable {
  const first = getFirstSets(grammar);
  const follow = getFollowSets(grammar, first);
  const nonterminals = [...grammar.nonterminals];
  const terminals = [...grammar.terminals, "$"];

  const table = new Map<string, Map<string, string>>();
  const conflicts: string[] = [];

  for (const nt of nonterminals) {
    table.set(nt, new Map());
  }

  for (const prod of grammar.productions) {
    for (const alt of prod.rhs) {
      const firstSet = firstOfSequence(alt, grammar, first);
      const target = table.get(prod.lhs)!;

      for (const terminal of firstSet) {
        if (terminal === "epsilon") continue;
        setCell(target, terminal, formatRule(prod.lhs, alt), conflicts);
      }

      if (firstSet.has("epsilon")) {
        const followSet = follow.get(prod.lhs)!;
        followSet.forEach((terminal) => {
          setCell(target, terminal, formatRule(prod.lhs, alt), conflicts);
        });
      }
    }
  }

  return { nonterminals, terminals, table, conflicts, productions: grammar.productions };
}

function setCell(
  row: Map<string, string>,
  terminal: string,
  value: string,
  conflicts: string[]
) {
  const existing = row.get(terminal);
  if (existing && existing !== value) {
    conflicts.push(`Conflict at ${terminal}: ${existing} vs ${value}`);
  } else {
    row.set(terminal, value);
  }
}

function formatRule(lhs: string, alt: string[]): string {
  return `${lhs} -> ${alt.join(" ")}`;
}
