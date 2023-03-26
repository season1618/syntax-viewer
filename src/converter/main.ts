import { tokenize } from './lexer';
import { Expr, parse } from './parser';

function convert(code: string): Expr | undefined {
  return parse(tokenize(code));
}

export { convert };