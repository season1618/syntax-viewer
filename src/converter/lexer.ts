export type Token = OpenPar | ClosePar | Ident | Num;

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

interface Num {
  kind: 'num';
  value: string;
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
    if (isNumeric(code[i])) {
      let val = '';
      while (i < code.length && isNumeric(code[i])) {
        val += code[i];
        i++;
      }
      tokenList.push({ kind: 'num', value: val });
      continue;
    }
    let ident = '';
    while (i < code.length && (isIdent(code[i]) || isNumeric(code[i]))) {
      ident.concat(code[i]);
      i++;
    }
    tokenList.push({ kind: 'ident', ident: ident });
  }console.log(tokenList);
  return tokenList;
}

function isWhitespace(str: string): boolean {
  return [' ', '\n', '\t', '\v', '\f', '\r'].includes(str);
}

function isNumeric(str: string): boolean {
  return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(str);
}

function isIdent(str: string): boolean {
  return /^[a-zA-Z]/.test(str) || ['|', '&', '!', '=', '<', '>', '+', '-', '*', '/', '%'].includes(str);
}

function convertStringToNum(str: string): Option<number> {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = 0; i < 10; i++) {
    if (digits[i] === str) {
      return { kind: "some", value: i };
    }
  }
  return { kind: "none" };
}

export type Option<T> = None | Some<T>;

interface None {
  kind: 'none';
}

interface Some<T> {
  kind: 'some';
  value: T;
}

export { tokenize };