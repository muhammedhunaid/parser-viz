import { Grammar, LRAutomaton, LRItem, LRState, Production } from "./types";

export function buildLRAutomaton(grammar: Grammar): LRAutomaton {
  const augmented = augmentGrammar(grammar);
  const startItem: LRItem = {
    production: augmented.productions[0],
    altIndex: 0,
    dot: 0,
  };

  const startState = closure([startItem], augmented);
  const states: LRState[] = [];
  const edges: LRAutomaton["edges"] = [];
  const queue: LRItem[][] = [];
  const stateMap = new Map<string, number>();

  const startKey = stateKey(startState);
  stateMap.set(startKey, 0);
  states.push({ id: 0, items: startState });
  queue.push(startState);

  while (queue.length > 0) {
    const items = queue.shift()!;
    const fromId = stateMap.get(stateKey(items))!;
    const symbols = new Set<string>();

    for (const item of items) {
      const rhs = item.production.rhs[item.altIndex];
      if (item.dot < rhs.length) {
        symbols.add(rhs[item.dot]);
      }
    }

    for (const symbol of symbols) {
      const nextItems = closure(goto(items, symbol), augmented);
      if (nextItems.length === 0) continue;

      const key = stateKey(nextItems);
      let toId = stateMap.get(key);
      if (toId === undefined) {
        toId = states.length;
        stateMap.set(key, toId);
        states.push({ id: toId, items: nextItems });
        queue.push(nextItems);
      }

      edges.push({ from: fromId, to: toId, symbol });
    }
  }

  return { states, edges };
}

function augmentGrammar(grammar: Grammar): Grammar {
  const start = grammar.startSymbol;
  const augmentedStart = `${start}'`;
  const production: Production = {
    lhs: augmentedStart,
    rhs: [[start]],
  };

  return {
    ...grammar,
    startSymbol: augmentedStart,
    productions: [production, ...grammar.productions],
    nonterminals: new Set([augmentedStart, ...grammar.nonterminals]),
  };
}

function closure(items: LRItem[], grammar: Grammar): LRItem[] {
  const result: LRItem[] = [...items];
  const added = new Set<string>(items.map(itemKey));

  let changed = true;
  while (changed) {
    changed = false;
    for (const item of [...result]) {
      const rhs = item.production.rhs[item.altIndex];
      const symbol = rhs[item.dot];
      if (!symbol || !grammar.nonterminals.has(symbol)) continue;

      for (const prod of grammar.productions) {
        if (prod.lhs !== symbol) continue;
        prod.rhs.forEach((_, altIndex) => {
          const nextItem: LRItem = { production: prod, altIndex, dot: 0 };
          const key = itemKey(nextItem);
          if (!added.has(key)) {
            result.push(nextItem);
            added.add(key);
            changed = true;
          }
        });
      }
    }
  }

  return result;
}

function goto(items: LRItem[], symbol: string): LRItem[] {
  const moved: LRItem[] = [];
  for (const item of items) {
    const rhs = item.production.rhs[item.altIndex];
    if (item.dot < rhs.length && rhs[item.dot] === symbol) {
      moved.push({ ...item, dot: item.dot + 1 });
    }
  }
  return moved;
}

function itemKey(item: LRItem): string {
  return `${item.production.lhs}:${item.altIndex}:${item.dot}`;
}

function stateKey(items: LRItem[]): string {
  return items
    .map((item) => itemKey(item))
    .sort()
    .join("|");
}
