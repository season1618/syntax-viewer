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
  shift: number;
  offset: number;
  depth: number;
  childs: Node[];
  belows: Node[];
  thread: Node | null;

  visited: boolean;
  havePar: boolean;

  constructor(label: string, childs: Node[]) {
    this.label = label;
    this.shift = 0;
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
        this.belows.push(node);
        node.havePar = true;
        node.calcBelows();
      }
    }
  }

  calcOffset() {
    for (const below of this.belows) {
      below.calcOffset();
    }

    let leftRC: number[] = [];
    let rightLC: number[];
    for (let i = 1; i < this.belows.length; i++) {
      let leftTree = this.belows[i-1];
      let rightTree = this.belows[i];

      // get contour
      leftRC = maxArray(leftRC, leftTree.rightContour());
      rightLC = rightTree.leftContour();

      // set thread
      if (leftRC.length < rightLC.length) {
        this.setLeftThread(this.belows[0], this.belows[i]);
      }
      if (leftRC.length > rightLC.length) {
        this.setRightThread(this.belows[i-1], this.belows[i]);
      }

      // get space
      let space = 0;
      for (let j = 0; j < Math.min(leftRC.length, rightLC.length); j++) {
        space = Math.max(space, 1 + leftRC[j] - rightLC[j]);
      }

      this.belows[i].offset += space;
      this.belows[i].shift = space;
    }

    if (this.belows.length === 0) this.offset = 0;
    else this.offset = this.belows.map(below => below.offset).reduce((sum, v) => sum + v, 0) / this.belows.length;
  }

  calcAbsolute(origin: number = 0) {
    this.belows.forEach(below => below.calcAbsolute(origin + this.shift));
    this.offset += origin;
  }

  leftContour(origin: number = 0): number[] {
    if (this.left() === null) return [origin + this.offset];
    else return [origin + this.offset, ...this.left()!.leftContour(origin + this.shift)];
  }

  rightContour(origin: number = 0): number[] {
    if (this.right() === null) return [origin + this.offset];
    else return [origin + this.offset, ...this.right()!.rightContour(origin + this.shift)];
  }

  setLeftThread(leftTree: Node, rightTree: Node) {
    if (leftTree.left() === null) {
      leftTree.thread = rightTree.left();
    } else {
      this.setLeftThread(leftTree.left()!, rightTree.left()!);
    }
  }

  setRightThread(leftTree: Node, rightTree: Node) {
    if (rightTree.right() === null) {
      rightTree.thread = leftTree.right();
    } else {
      this.setRightThread(leftTree.right()!, rightTree.right()!);
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
}

export { Node };