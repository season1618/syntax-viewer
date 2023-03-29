import { Token } from './lexer';

export type Expr = Call | Var | Prim;

interface Call {
  kind: 'call';
  depth: number;
  offset: number;
  label: string;
  args: Expr[];
}

interface Var {
  kind: 'var';
  depth: number;
  offset: number;
  label: string;
  expr: Expr;
}

interface Prim {
  kind: 'prim';
  depth: number;
  offset: number;
  label: string;
}

class SymbolTable {
  table: { name: string; expr: Expr; }[];

  constructor() {
    this.table = [];
  }

  push(name: string, expr: Expr) {
    this.table.push({ name, expr });
  }

  find(name: string): Expr | undefined {
    for (const symbol of this.table) {
      if (symbol.name === name) {
        return symbol.expr;
      }
    }
    return undefined;
  }
}

class OffsetTable {
  table: { [depth: number]: Set<number> };

  constructor() {
    this.table = {};
  }

  nodeOffset(depth: number, offset: number): number {
    if (!(depth in this.table)) {
      this.table[depth] = new Set();
    }
    for (let i = 0; ; i++) {
      if (!this.table[depth].has(offset + i)) {
        this.table[depth].add(offset + i);
        return offset + i;
      }
      if (!this.table[depth].has(offset - i)) {
        this.table[depth].add(offset - i);
        return offset - i;
      }
    }
  }

  leafOffset(depth: number): number {
    if (!(depth in this.table)) {
      this.table[depth] = new Set();
    }
    let maxOffset = Math.max(-1, ...this.table[depth]);
    this.table[depth].add(maxOffset + 1);
    return maxOffset + 1;
  }
}

function parse(tokenList: Token[]): Expr | undefined {
  let st = new SymbolTable();
  let offsetTable = new OffsetTable();
  let i = 0;
  while (i < tokenList.length) {
    if (expect('(')) {
      if (expect('define')) {
        let name = parse_ident();
        let expr = parse_expr(0);
        console.log(name, expr);
        if (name !== undefined && expr !== undefined) {
          st.push(name, expr);
          consume(')');
        } else {
          return undefined;
        }
        continue;
      }
      i--;
    }
    let expr = parse_expr(0);
    console.log(expr);
    return expr;
    // return parse_expr();
  }

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

  function parse_expr(d: number): Expr | undefined {
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
          let arg = parse_expr(d + 1);
          if (arg !== undefined) args.push(arg);
          else return undefined;
        }

        let offset;
        if (args.length === 0) offset = offsetTable.leafOffset(d);
        else offset = offsetTable.nodeOffset(d, args.map((arg) => arg.offset).reduce((sum, val) => sum + val, 0) / args.length);
        
        return { kind: 'call', depth: d, offset, label, args };
      case 'closepar':
        i++;
        return undefined;
      case 'ident':
        i++;
        const symbol = st.find(token.ident);
        if (symbol === undefined) return { kind: 'prim', depth: d, offset: offsetTable.leafOffset(d), label: token.ident };
        else return { kind: 'var', depth: d, offset: symbol.offset, label: token.ident, expr: symbol };
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