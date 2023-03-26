import { Token } from './lexer';

export type Expr = Call | Prim;

interface Call {
  kind: 'call';
  proc: string;
  args: Expr[];
}

interface Prim {
  kind: 'prim';
  value: string;
}

type Var = {
  name: string;
  expr: Expr;
}

class SymbolTable {
  table: Var[];

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

function parse(tokenList: Token[]): Expr | undefined {
  let st = new SymbolTable();
  let i = 0;
  while (i < tokenList.length) {
    if (expect('(')) {
      if (expect('define')) {
        let name = parse_ident();
        let expr = parse_expr();
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
    let expr = parse_expr();
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

  function parse_expr(): Expr | undefined {
    if (i >= tokenList.length) {
      return undefined;
    }

    let token = tokenList[i];
    switch (token.kind) {
      case 'openpar':
        i++;

        let proc = parse_ident();
        if (proc === undefined) {
          return undefined;
        }
        
        let args: Expr[] = [];
        while (!expect(')')) {
          let arg = parse_expr();
          if (arg !== undefined) args.push(arg);
          else return undefined;
        }
        return { kind: 'call', proc, args };
      case 'closepar':
        i++;
        return undefined;
      case 'ident':
        i++;
        const symbol = st.find(token.ident);
        if (symbol === undefined) return { kind: 'prim', value: token.ident };
        else return symbol;
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