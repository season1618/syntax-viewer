import { tokenize } from './lexer';
import { AST, parse } from './parser';

function convert(code: string): AST {
  return parse(tokenize(code));
}

export { convert };