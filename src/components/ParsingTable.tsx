import { ParsingTable } from "../utils/types";

type Props = {
  table: ParsingTable;
};

export default function ParsingTableView({ table }: Props) {
  return (
    <div className="panel fade-in">
      <h2>Parsing Table</h2>
      {table.conflicts.length > 0 && (
        <div className="error-text" style={{ marginBottom: 8 }}>
          Conflicts: {table.conflicts.join(" | ")}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nonterminal</th>
              {table.terminals.map((term) => (
                <th key={term}>{term}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.nonterminals.map((nt) => (
              <tr key={nt}>
                <td>{nt}</td>
                {table.terminals.map((term) => (
                  <td key={`${nt}-${term}`}>{table.table.get(nt)?.get(term) ?? "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
