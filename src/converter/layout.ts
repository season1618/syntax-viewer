import { Ast } from './parser'

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
  thread: Node | null;

  visited: boolean;
  havePar: boolean;

  constructor(label: string, childs: Node[]) {
    this.label = label;
    this.offset = 0;
    this.depth = 0;
    this.childs = childs;
    this.belows = [];
    this.thread = null;

    this.visited = false;
    this.havePar = false;
  }

  static build(ast: Ast, symbolTable: SymbolTable = new SymbolTable()): Node {
    switch (ast.kind) {
      case 'call': {
        let childs = [];
        for (const arg of ast.args) {
          const node = Node.build(arg, symbolTable);
          childs.push(node);
        }
        return new Node(ast.label, childs);
      }
      case 'prim': {
        return new Node(ast.label, []);
      }
      case 'var': {
        let node = symbolTable.find(ast.label);
        if (node === undefined) {
          let child = Node.build(ast.value, symbolTable);
          node = new Node(ast.label, [child]);
          symbolTable.push(ast.label, node);
        }
        return node;
      }
    }
  }

  calcDepth() {
    const torder = this.tsortReverse().reverse();
    for (const node of torder) {
      for (const child of node.childs) {
        child.depth = Math.max(child.depth, node.depth + 1);
      }
    }
  }

  tsortReverse(array: Node[] = []): Node[] {
    if (this.visited) return array;
    this.visited = true;

    for (const child of this.childs) {
      child.tsortReverse(array);
    }
    array.push(this);
    return array;
  }

  calcBelows() {
    for (const node of this.childs) {
      if (this.depth + 1 === node.depth && !node.havePar) {
        node.havePar = true;
        this.belows.push(node);
        node.calcBelows();
      }
    }
  }

  calcOffset() {
    for (const below of this.belows) {
      below.calcOffset();
    }

    let rightContour: number[] = [];
    let leftContour: number[];
    for (let i = 1; i < this.belows.length; i++) {
      let leftTree = this.belows[i-1];
      let rightTree = this.belows[i];

      // get contour
      rightContour = maxArray(rightContour, leftTree.rightContour());
      leftContour = rightTree.leftContour();

      // set thread
      if (rightContour.length < leftContour.length) {
        this.setLeftThread(this.belows[0], this.belows[i]);
      }
      if (rightContour.length > leftContour.length) {
        this.setRightThread(this.belows[i-1], this.belows[i]);
      }

      let diff = [];
      for (let i = 0; i < Math.min(rightContour.length, leftContour.length); i++) {
        diff.push(1 + rightContour[i] - leftContour[i]);
      }
      let shift = diff.reduce((max, v) => Math.max(max, v), 0);
      rightTree.move(shift);
    }

    if (this.belows.length === 0) {
      this.offset = 0;
    } else {
      this.offset = this.belows.map(below => below.offset).reduce((sum, v) => sum + v, 0) / this.belows.length;
    }
  }

  leftContour(): number[] {
    const left = this.left();
    if (left === null) return [this.offset];
    else return [this.offset, ...left.leftContour()];
  }

  rightContour(): number[] {
    const right = this.right();
    if (right === null) return [this.offset];
    else return [this.offset, ...right.rightContour()];
  }

  setLeftThread(leftTree: Node, rightTree: Node) {
    let left = leftTree.left();
    let right = rightTree.left();
    if (left === null || right === null) {
      leftTree.thread = right;
    } else {
      this.setLeftThread(left, right);
    }
  }

  setRightThread(leftTree: Node, rightTree: Node) {
    let left = leftTree.right();
    let right = rightTree.right();
    if (left === null || right === null) {
      rightTree.thread = left;
    } else {
      this.setRightThread(left, right);
    }
  }

  left(): Node | null {
    if (this.thread !== null) return this.thread;
    if (this.belows.length !== 0) return this.belows[0];
    return null;
  }

  right(): Node | null {
    if (this.thread !== null) return this.thread;
    if (this.belows.length !== 0) return this.belows[this.belows.length - 1];
    return null;
  }

  move(shift: number) {
    this.offset += shift;
    for (const below of this.belows) {
      below.move(shift);
    }
  }
}

export { Node };