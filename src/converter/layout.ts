import { Ast, SymbolTable } from './parser'

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
  label: string;
  offset: number;
  depth: number;
  childs: Node[];
  belows: Node[];

  constructor(ast: Ast) {
    this.label = ast.label;
    this.offset = 0;
    this.depth = ast.getDepth();
    this.childs = [];
    this.belows = [];
    if (ast.kind == 'call') {
      for (const arg of ast.args) {
        const node = new Node(arg);
        this.childs.push(node);
        if (this.depth + 1 == node.depth) this.belows.push(node);
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