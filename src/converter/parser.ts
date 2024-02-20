import { Token } from './lexer';

let symbolTable: SymbolTable;

export type Ast = Expr;
export type Expr = Call | Prim | Var;

class Call {
  kind: 'call';
  depth: number;
  label: string;
  args: Expr[];

  constructor(depth: number, label: string, args: Expr[]) {
    this.kind = 'call';
    this.depth = depth;
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
}

class Prim {
  kind: 'prim';
  depth: number;
  label: string;

  constructor(depth: number, label: string) {
    this.kind = 'prim';
    this.depth = depth;
    this.label = label;
  }

  getDepth(): number {
    return this.depth;
  }

  updateDepth(depth: number) {
    this.depth = Math.max(this.depth, depth);
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

function parse(tokenList: Token[]): Ast | undefined {
  let root;
  symbolTable = new SymbolTable();
  let i = 0;
  while (i < tokenList.length) {
    if (expect('(')) {
      if (expect('define')) {
        let name = parse_ident();
        let expr = parse_expr(0);
        if (name !== undefined && expr !== undefined) {
          symbolTable.push(name, expr);
          consume(')');
          continue;
        } else {
          root = undefined;
          break;
        }
      }
      i--;
    }
    root = parse_expr(0);
    break;
  }
  
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

export { SymbolTable, parse };