import { Ast, SymbolTable } from './parser'

class OffsetTable {
  table: { [depth: number]: Set<number> };

  constructor() {
    this.table = {};
  }

  calcOffset(depth: number, offset: number = -1): number {
    if (!(depth in this.table)) {
      this.table[depth] = new Set();
    }
    let maxOffset = Math.max(-1, ...this.table[depth]);
    let finOffset = Math.max(maxOffset + 1, offset);
    this.table[depth].add(finOffset);
    return finOffset;
  }
}

class Node {
  offset: number;
  depth: number;
  label: string;
  childs: Node[];
  belows: Node[];

  constructor(offset: number, depth: number, label: string, childs: Node[], belows: Node[]) {
    this.offset = offset;
    this.depth = depth;
    this.label = label;
    this.childs = childs;
    this.belows = belows;
  }
}

function layout(ast: Ast, offsetTable: OffsetTable = new OffsetTable()): Node {
  let label = ast.label;
  let offset = 0;
  let depth = ast.getDepth();
  let childs: Node[] = [];
  let belows: Node[] = [];
  switch (ast.kind) {
    case 'call': {
      for (const arg of ast.args) {
        const node = layout(arg, offsetTable);
        childs.push(node);
        if (depth + 1 == node.depth) belows.push(node);
      }
      if (childs.length === 0) {
        offset = offsetTable.calcOffset(ast.depth);
      } else {
        let avgOffset = childs.map((child) => child.offset).reduce((sum, val) => sum + val, 0) / ast.args.length;
        offset = offsetTable.calcOffset(ast.depth, avgOffset);
        console.log(avgOffset, offset);
      }
      break;
    }
    case 'prim': {
      offset = offsetTable.calcOffset(ast.depth);
      break;
    }
    case 'var': {
      break;
    }
  }
  
  return new Node(offset, depth, label, childs, belows);
}

export { Node, layout };