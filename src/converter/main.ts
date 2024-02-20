import { tokenize } from './lexer';
import { Ast, parse } from './parser';

function convert(code: string): Ast | undefined {
  const root = parse(tokenize(code));
  if (root !== undefined) {
    root.setOffset();
  }
  // symbolTable.setOffset();
  return root;
}

export { convert };