import { Token } from './lexer';

let symbolTable: SymbolTable;

export type Ast = Expr;
export type Expr = Call | Prim | Var;

class Call {
  kind: 'call';
  label: string;
  args: Expr[];

  constructor(label: string, args: Expr[]) {
    this.kind = 'call';
    this.label = label;
    this.args = args;
  }
}

class Prim {
  kind: 'prim';
  label: string;

  constructor(label: string) {
    this.kind = 'prim';
    this.label = label;
  }
}

class Var {
  kind: 'var';
  label: string;
  value: Expr;

  constructor(label: string, value: Expr) {
    this.kind = 'var';
    this.label = label;
    this.value = value;
  }
}

class SymbolTable {
  table: { name: string; value: Expr; }[];

  constructor() {
    this.table = [];
  }

  push(name: string, value: Expr) {
    this.table.push({ name, value });
  }

  find(name: string): Expr | undefined {
    for (const symbol of this.table) {
      if (symbol.name === name) {
        return symbol.value;
      }
    }
    return undefined;
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

        return new Call(label, args);
      case 'closepar':
        i++;
        return undefined;
      case 'ident':
        i++;
        const symbol = symbolTable.find(token.ident);
        if (symbol === undefined) return new Prim(token.ident);
        else {
          return new Var(token.ident, symbol);
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