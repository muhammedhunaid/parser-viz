export type Production = {
  lhs: string;
  rhs: string[][]; // alternatives of token arrays
};

export type Grammar = {
  productions: Production[];
  startSymbol: string;
  nonterminals: Set<string>;
  terminals: Set<string>;
};

export type ParsingTable = {
  nonterminals: string[];
  terminals: string[];
  table: Map<string, Map<string, string>>;
  conflicts: string[];
  productions: Production[];
};

export type LRItem = {
  production: Production;
  altIndex: number;
  dot: number;
};

export type LRState = {
  id: number;
  items: LRItem[];
};

export type LREdge = {
  from: number;
  to: number;
  symbol: string;
};

export type LRAutomaton = {
  states: LRState[];
  edges: LREdge[];
};

export type ParseStep = {
  index: number;
  stack: string;
  input: string;
  action: string;
};

export type ValidationReport = {
  errors: string[];
  warnings: string[];
};

export type AnalysisReport = {
  nullable: string[];
  first: Map<string, Set<string>>;
  follow: Map<string, Set<string>>;
};
