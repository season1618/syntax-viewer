import { Token } from './lexer';

let symbolTable: SymbolTable;
let offsetTable: OffsetTable;

export type Expr = Call | Prim | Var;

class Call {
  kind: 'call';
  depth: number;
  offset: number;
  label: string;
  args: Expr[];

  constructor(depth: number, label: string, args: Expr[]) {
    this.kind = 'call';
    this.depth = depth;
    this.offset = -1;
    this.label = label;
    this.args = args;
  }

  getDepth(): number {
    return this.depth;
  }

  updateDepth(depth: number) {
    this.depth = Math.max(this.depth, depth);
    for (const child of this.args) {
      child.updateDepth(depth + 1);
    }
  }

  getOffset(): number {
    return this.offset;
  }

  setOffset() {
    for (const child of this.args) {
      child.setOffset();
    }
    if (this.args.length === 0) {
      this.offset = offsetTable.calcOffset(this.depth);
    } else {
      let avgOffset = this.args.map((arg) => arg.getOffset()).reduce((sum, val) => sum + val, 0) / this.args.length;
      this.offset = offsetTable.calcOffset(this.depth, avgOffset);
    }
  }
}

export class Prim {
  kind: 'prim';
  depth: number;
  offset: number;
  label: string;

  constructor(depth: number, label: string) {
    this.kind = 'prim';
    this.depth = depth;
    this.offset = -1;
    this.label = label;
  }

  getDepth(): number {
    return this.depth;
  }

  updateDepth(depth: number) {
    this.depth = Math.max(this.depth, depth);
  }

  getOffset(): number {
    return this.offset;
  }

  setOffset() {
    this.offset = offsetTable.calcOffset(this.depth);
  }
}

class Var {
  kind: 'var';
  label: string;
  id: number;

  constructor(label: string) {
    this.kind = 'var';
    this.label = label;
    this.id = symbolTable.getId(label);
  }

  getDepth(): number {
    let symbol = symbolTable.table[this.id];
    return symbol.depth;
  }

  updateDepth(depth: number) {
    symbolTable.updateDepth(this.label, depth);
  }

  getOffset(): number {
    let symbol = symbolTable.table[this.id];
    return symbol.offset;
  }

  setOffset() {
    let symbol = symbolTable.table[this.id];
    if (symbol.offset === -1) {
      symbol.value.setOffset();
      symbol.offset = offsetTable.calcOffset(symbol.depth, symbol.value.getOffset());
    }
  }

  getValue(): Expr {
    return symbolTable.table[this.id].value;
  }
}

class SymbolTable {
  table: { name: string; depth: number; offset: number; value: Expr; }[];

  constructor() {
    this.table = [];
  }

  push(name: string, value: Expr) {
    this.table.push({ name, depth: -1, offset: -1, value });
  }

  find(name: string): Expr | undefined {
    for (const symbol of this.table) {
      if (symbol.name === name) {
        return symbol.value;
      }
    }
    return undefined;
  }

  getId(name: string): number {
    for (let index = 0; index < this.table.length; index++) {
      let symbol = this.table[index];
      if (symbol.name === name) {
        return index;
      }
    }
    return -1;
  }

  updateDepth(name: string, depth: number) {
    for (const symbol of this.table) {
      if (symbol.name === name) {
        symbol.depth = Math.max(symbol.depth, depth);
        symbol.value.updateDepth(depth + 1);
      }
    }
  }
}

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

function parse(tokenList: Token[]): Expr | undefined {
  let root;
  symbolTable = new SymbolTable();
  offsetTable = new OffsetTable();
  let i = 0;
  while (i < tokenList.length) {
    if (expect('(')) {
      if (expect('define')) {
        let name = parse_ident();
        let expr = parse_expr(0);
        if (name !== undefined && expr !== undefined) {
          symbolTable.push(name, expr);
          consume(')');
        } else {
          return undefined;
        }
        continue;
      }
      i--;
    }
    root = parse_expr(0);
    break;
  }

  if (root === undefined) return undefined;

  root.setOffset();
  return root;

  function parse_ident(): string | undefined {
    if (i < tokenList.length) {
      let token = tokenList[i];
      if (token.kind === 'ident') {
        i++;
        return token.ident;
      }
    }
    return undefined;
  }

  function parse_expr(depth: number): Expr | undefined {
    if (i >= tokenList.length) {
      return undefined;
    }

    let token = tokenList[i];
    switch (token.kind) {
      case 'openpar':
        i++;

        let label = parse_ident();
        if (label === undefined) {
          return undefined;
        }
        
        let args: Expr[] = [];
        while (!expect(')')) {
          let arg = parse_expr(depth + 1);
          if (arg !== undefined) args.push(arg);
          else return undefined;
        }

        return new Call(depth, label, args);
      case 'closepar':
        i++;
        return undefined;
      case 'ident':
        i++;
        const symbol = symbolTable.find(token.ident);
        if (symbol === undefined) return new Prim(depth, token.ident);
        else {
          symbolTable.updateDepth(token.ident, depth);
          return new Var(token.ident);
        }
    }
  }

  function expect(str: string): boolean {
    if (i >= tokenList.length) {
      return false;
    }

    let token = tokenList[i];
    switch (token.kind) {
      case 'openpar':
        if (str === '(') {
          i++;
          return true;
        } else {
          return false;
        }
      case 'closepar':
        if (str === ')') {
          i++;
          return true;
        } else {
          return false;
        }
      case 'ident':
        if (str === token.ident) {
          i++;
          return true;
        } else {
          return false;
        }
      default:
        return false;
    }
  }

  function consume(str: string) {
    if (i >= tokenList.length) {
      return;
    }

    let token = tokenList[i];
    switch (token.kind) {
      case 'openpar':
        if (str === '(') {
          i++;
        }
        break;
      case 'closepar':
        if (str === ')') {
          i++;
        }
        break;
      case 'ident':
        if (str === token.ident) {
          i++;
        }
        break;
    }
  }
}

export { parse };