import { tokenize } from './lexer';
import { AST, parse } from './parser';

function convert(code: string): AST {
  const [root, symbolTable] = parse(tokenize(code));
  if (root !== undefined) {
    root.setOffset();
  }
  symbolTable.setOffset();

  return [root, symbolTable];
}

export { convert };