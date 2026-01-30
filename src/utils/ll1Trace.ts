import { Grammar, ParseStep, ParsingTable } from "./types";

export type TraceResult = {
  steps: ParseStep[];
  accepted: boolean;
  error?: string;
};

export function buildLL1Trace(
  grammar: Grammar,
  table: ParsingTable,
  inputTokens: string[]
): TraceResult {
  const steps: ParseStep[] = [];
  const stack: string[] = ["$", grammar.startSymbol];
  const input = [...inputTokens, "$"];
  let cursor = 0;
  let index = 0;

  const pushStep = (action: string) => {
    steps.push({
      index: index++,
      stack: stack.join(" "),
      input: input.slice(cursor).join(" "),
      action,
    });
  };

  pushStep("Initialize LL(1) parse");

  while (stack.length > 0) {
    const top = stack.pop()!;
    const lookahead = input[cursor];

    if (top === "$" && lookahead === "$") {
      pushStep("Accept");
      return { steps, accepted: true };
    }

    if (!grammar.nonterminals.has(top)) {
      if (top === lookahead) {
        cursor += 1;
        pushStep(`Match terminal ${top}`);
        continue;
      }
      const error = `Unexpected token ${lookahead}, expected ${top}`;
      pushStep(`Error: ${error}`);
      return { steps, accepted: false, error };
    }

    const row = table.table.get(top);
    const production = row?.get(lookahead ?? "$");
    if (!production) {
      const error = `No rule for (${top}, ${lookahead ?? "$"})`;
      pushStep(`Error: ${error}`);
      return { steps, accepted: false, error };
    }

    const rhs = parseProduction(production);
    if (rhs.length === 1 && rhs[0] === "epsilon") {
      pushStep(`${production} (epsilon)`);
      continue;
    }

    for (let i = rhs.length - 1; i >= 0; i -= 1) {
      stack.push(rhs[i]);
    }
    pushStep(production);
  }

  const error = "Stack exhausted before input end";
  pushStep(`Error: ${error}`);
  return { steps, accepted: false, error };
}

function parseProduction(rule: string): string[] {
  const [, rhsRaw] = rule.split("->").map((part) => part.trim());
  if (!rhsRaw) return [];
  return rhsRaw.split(/\s+/).filter(Boolean);
}
