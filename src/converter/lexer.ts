export type Token = OpenPar | ClosePar | Ident;

interface OpenPar {
  kind: 'openpar';
}

interface ClosePar {
  kind: 'closepar';
}

interface Ident {
  kind: 'ident';
  ident: string;
}

function tokenize(code: string): Token[] {
  let tokenList: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (isWhitespace(code[i])) {
      i++;
      continue;
    }
    if (code[i] === '(') {
      i++;
      tokenList.push({ kind: 'openpar' });
      continue;
    }
    if (code[i] === ')') {
      i++;
      tokenList.push({ kind: 'closepar' });
      continue;
    }
    let ident = '';
    while (i < code.length) {
      if (isWhitespace(code[i]) || code[i] === '(' || code[i] === ')') break;
      ident = ident.concat(code[i]);
      i++;
    }
    tokenList.push({ kind: 'ident', ident: ident });
  }
  return tokenList;
}

function isWhitespace(str: string): boolean {
  return [' ', '\n', '\t', '\v', '\f', '\r'].includes(str);
}

export { tokenize };