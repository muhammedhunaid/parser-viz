import { useMemo } from "react";

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

type PositionedNode = TreeNode & { x: number; y: number };

type Props = {
  tree: TreeNode | null;
};

const width = 900;
const height = 360;
const levelGap = 80;

function layoutTree(root: TreeNode): PositionedNode[] {
  const nodes: PositionedNode[] = [];
  let xCursor = 80;

  const walk = (node: TreeNode, depth: number): number => {
    const y = 40 + depth * levelGap;
    let x = xCursor;

    if (node.children && node.children.length > 0) {
      const childXs = node.children.map((child) => walk(child, depth + 1));
      x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    } else {
      xCursor += 120;
    }

    nodes.push({ ...node, x, y });
    return x;
  };

  walk(root, 0);
  return nodes;
}

export default function ParseTree({ tree }: Props) {
  const nodes = useMemo(() => (tree ? layoutTree(tree) : []), [tree]);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  if (!tree) return null;

  return (
    <div className="panel fade-in">
      <h2>Parse Tree</h2>
      <svg className="tree" viewBox={`0 0 ${width} ${height}`}>
        {nodes.flatMap((node) =>
          (node.children ?? []).map((child) => {
            const childNode = nodeMap.get(child.id);
            if (!childNode) return null;
            return (
              <line
                key={`${node.id}-${child.id}`}
                x1={node.x}
                y1={node.y}
                x2={childNode.x}
                y2={childNode.y}
                stroke="rgba(124, 240, 255, 0.5)"
              />
            );
          })
        )}
        {nodes.map((node) => {
          const isNonterminal = (node.children?.length ?? 0) > 0;
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={18}
                fill={isNonterminal ? "rgba(124, 240, 255, 0.9)" : "rgba(124, 255, 166, 0.9)"}
              />
              <text x={node.x} y={node.y + 4} fontSize="12" textAnchor="middle" fill="#0b0f14">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="legend" style={{ marginTop: 12 }}>
        <span>
          <span className="dot" /> Nonterminals
        </span>
        <span>
          <span className="dot green" /> Terminals
        </span>
      </div>
    </div>
  );
}
