import { Ast } from './parser'

function minArray(a: number[], b: number[]): number[] {
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  let res = [];
  for (let i = 0; i < a.length; i++) res.push(Math.min(a[i], b[i]));
  for (let i = a.length; i < b.length; i++) res.push(b[i]);
  return res;
}

function maxArray(a: number[], b: number[]): number[] {
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  let res = [];
  for (let i = 0; i < a.length; i++) res.push(Math.max(a[i], b[i]));
  for (let i = a.length; i < b.length; i++) res.push(b[i]);
  return res;
}

class SymbolTable {
  table: { name: string; value: Node; }[];

  constructor() {
    this.table = [];
  }

  push(name: string, value: Node) {
    this.table.push({ name, value });
  }

  find(name: string): Node | undefined {
    for (const symbol of this.table) {
      if (symbol.name === name) {
        return symbol.value;
      }
    }
    return undefined;
  }
}

class Node {
  label: string;
  offset: number;
  depth: number;
  childs: Node[];
  belows: Node[];

  constructor(label: string, offset: number, depth: number, childs: Node[], belows: Node[]) {
    this.label = label;
    this.offset = offset;
    this.depth = depth;
    this.childs = childs;
    this.belows = belows;
  }

  static build(ast: Ast, symbolTable: SymbolTable = new SymbolTable()): Node {
    switch (ast.kind) {
      case 'call': {
        let depth = ast.getDepth();
        let childs = [];
        let belows = [];
        for (const arg of ast.args) {
          const node = Node.build(arg, symbolTable);
          childs.push(node);
          if (depth + 1 == node.depth) belows.push(node);
        }
        return new Node(ast.label, 0, depth, childs, belows);
      }
      case 'prim': {
        return new Node(ast.label, 0, ast.getDepth(), [], []);
      }
      case 'var': {
        let node = symbolTable.find(ast.label);
        if (node == undefined) {
          let child = Node.build(ast.getValue(), symbolTable);
          node = new Node(ast.label, 0, ast.getDepth(), [child], [child]);
          symbolTable.push(ast.label, node);
        }
        return node;
      }
    }
  }

  calcOffset() {
    for (const below of this.belows) {
      below.calcOffset();
    }

    let accContRight: number[] = [];
    for (let i = 1; i < this.belows.length; i++) {
      let treeLeft = this.belows[i-1];
      let treeRight = this.belows[i];

      let diff = [];
      accContRight = maxArray(accContRight, treeLeft.contourRight());
      let contLeft = treeRight.contourLeft();
      for (let i = 0; i < Math.min(accContRight.length, contLeft.length); i++) {
        diff.push(1 + accContRight[i] - contLeft[i]);
      }
      
      let shift = diff.reduce((max, v) => Math.max(max, v), 0);
      treeRight.move(shift);
    }

    if (this.belows.length == 0) {
      this.offset = 0;
    } else {
      this.offset = this.belows.map(below => below.offset).reduce((sum, v) => sum + v, 0) / this.belows.length;
    }
  }

  contourLeft(): number[] {
    const contourBelow = this.belows
      .map(below => below.contourLeft())
      .reduce(minArray, [])
    return [this.offset, ...contourBelow];
  }

  contourRight(): number[] {
    const contourBelow = this.belows
      .map(below => below.contourRight())
      .reduce(maxArray, [])
    return [this.offset, ...contourBelow];
  }

  move(shift: number) {
    this.offset += shift;
    for (const below of this.belows) {
      below.move(shift);
    }
  }
}

export { Node };