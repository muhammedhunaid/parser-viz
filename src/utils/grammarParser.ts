import { Grammar, Production, ValidationReport } from "./types";

export class GrammarParseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const tokenRegex = /[A-Za-z_][A-Za-z0-9_]*|\(|\)|\+|\*|\-|\//g;

export function parseGrammar(raw: string): Grammar {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length === 0) {
    throw new GrammarParseError("Grammar is empty.");
  }

  const productions: Production[] = [];

  for (const line of lines) {
    const match = line.match(/^(\w+)\s*->\s*(.+)$/);
    if (!match) {
      throw new GrammarParseError(`Invalid production: "${line}". Use "A -> B | C".`);
    }

    const lhs = match[1];
    const rhsRaw = match[2];
    const alternatives = rhsRaw
      .split("|")
      .map((alt) => alt.trim())
      .filter(Boolean);

    if (alternatives.length === 0) {
      throw new GrammarParseError(`No alternatives provided for ${lhs}.`);
    }

    const rhs = alternatives.map((alt) => {
      if (alt === "epsilon") {
        return ["epsilon"];
      }
      const tokens = alt.match(tokenRegex) ?? [];
      if (tokens.length === 0) {
        throw new GrammarParseError(`Empty alternative for ${lhs}.`);
      }
      return tokens;
    });

    productions.push({ lhs, rhs });
  }

  const nonterminals = new Set(productions.map((p) => p.lhs));
  const terminals = new Set<string>();

  for (const prod of productions) {
    for (const alt of prod.rhs) {
      for (const symbol of alt) {
        if (symbol === "epsilon") continue;
        if (!nonterminals.has(symbol)) terminals.add(symbol);
      }
    }
  }

  return {
    productions,
    startSymbol: productions[0].lhs,
    nonterminals,
    terminals,
  };
}

export function validateGrammar(grammar: Grammar): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const defined = new Set(grammar.productions.map((p) => p.lhs));
  const referenced = new Set<string>();

  for (const prod of grammar.productions) {
    for (const alt of prod.rhs) {
      for (const symbol of alt) {
        if (symbol === "epsilon") continue;
        if (/[A-Za-z_]/.test(symbol[0])) referenced.add(symbol);
      }
    }
  }

  const undefinedRefs = [...referenced].filter(
    (sym) => !defined.has(sym) && sym.toUpperCase() === sym
  );
  if (undefinedRefs.length > 0) {
    errors.push(`Undefined nonterminals: ${undefinedRefs.join(", ")}.`);
  }

  const leftRecursive = grammar.productions
    .filter((p) => p.rhs.some((alt) => alt[0] === p.lhs))
    .map((p) => p.lhs);
  if (leftRecursive.length > 0) {
    warnings.push(`Left recursion detected: ${leftRecursive.join(", ")}.`);
  }

  const unreachable = findUnreachable(grammar);
  if (unreachable.length > 0) {
    warnings.push(`Unreachable nonterminals: ${unreachable.join(", ")}.`);
  }

  return { errors, warnings };
}

export function getFirstSets(grammar: Grammar): Map<string, Set<string>> {
  const first = new Map<string, Set<string>>();
  grammar.nonterminals.forEach((nt) => first.set(nt, new Set()));

  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of grammar.productions) {
      const target = first.get(prod.lhs)!;
      for (const alt of prod.rhs) {
        let nullable = true;
        for (const symbol of alt) {
          if (symbol === "epsilon") {
            if (!target.has("epsilon")) {
              target.add("epsilon");
              changed = true;
            }
            nullable = false;
            break;
          }
          if (!grammar.nonterminals.has(symbol)) {
            if (!target.has(symbol)) {
              target.add(symbol);
              changed = true;
            }
            nullable = false;
            break;
          }
          const symbolFirst = first.get(symbol)!;
          for (const item of symbolFirst) {
            if (item !== "epsilon" && !target.has(item)) {
              target.add(item);
              changed = true;
            }
          }
          if (!symbolFirst.has("epsilon")) {
            nullable = false;
            break;
          }
        }
        if (nullable && !target.has("epsilon")) {
          target.add("epsilon");
          changed = true;
        }
      }
    }
  }

  return first;
}

export function getFollowSets(
  grammar: Grammar,
  first: Map<string, Set<string>>
): Map<string, Set<string>> {
  const follow = new Map<string, Set<string>>();
  grammar.nonterminals.forEach((nt) => follow.set(nt, new Set()));
  follow.get(grammar.startSymbol)!.add("$");

  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of grammar.productions) {
      for (const alt of prod.rhs) {
        for (let i = 0; i < alt.length; i++) {
          const symbol = alt[i];
          if (!grammar.nonterminals.has(symbol)) continue;
          const trailer = alt.slice(i + 1);
          const followSet = follow.get(symbol)!;
          const before = followSet.size;

          const firstOfTrailer = firstOfSequence(trailer, grammar, first);
          for (const item of firstOfTrailer) {
            if (item !== "epsilon") followSet.add(item);
          }
          if (firstOfTrailer.has("epsilon") || trailer.length === 0) {
            const lhsFollow = follow.get(prod.lhs)!;
            lhsFollow.forEach((item) => followSet.add(item));
          }

          if (followSet.size !== before) changed = true;
        }
      }
    }
  }

  return follow;
}

export function firstOfSequence(
  sequence: string[],
  grammar: Grammar,
  first: Map<string, Set<string>>
): Set<string> {
  const result = new Set<string>();
  if (sequence.length === 0) {
    result.add("epsilon");
    return result;
  }

  for (const symbol of sequence) {
    if (symbol === "epsilon") {
      result.add("epsilon");
      return result;
    }
    if (!grammar.nonterminals.has(symbol)) {
      result.add(symbol);
      return result;
    }
    const symbolFirst = first.get(symbol)!;
    symbolFirst.forEach((item) => {
      if (item !== "epsilon") result.add(item);
    });
    if (!symbolFirst.has("epsilon")) {
      return result;
    }
  }

  result.add("epsilon");
  return result;
}

function findUnreachable(grammar: Grammar): string[] {
  const reachable = new Set<string>([grammar.startSymbol]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of grammar.productions) {
      if (!reachable.has(prod.lhs)) continue;
      for (const alt of prod.rhs) {
        for (const symbol of alt) {
          if (grammar.nonterminals.has(symbol) && !reachable.has(symbol)) {
            reachable.add(symbol);
            changed = true;
          }
        }
      }
    }
  }

  return [...grammar.nonterminals].filter((nt) => !reachable.has(nt));
}
