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

const inf = 1e9;

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

function layout(ast: Ast, offsetTable: OffsetTable = new OffsetTable()): Node {
  let label = ast.label;
  let offset = 0;
  let depth = ast.getDepth();
  let childs: Node[] = [];
  let belows: Node[] = [];
  if (ast.kind == 'call') {
    for (const arg of ast.args) {
      const node = layout(arg, offsetTable);
      childs.push(node);
      if (depth + 1 == node.depth) belows.push(node);
    }
  }
  
  return new Node(offset, depth, label, childs, belows);
}

export { Node, layout };