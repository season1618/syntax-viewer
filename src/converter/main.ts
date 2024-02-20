import { tokenize } from './lexer';
import { Ast, parse } from './parser';
import { Node, layout } from './layout';

function convert(code: string): Node | undefined {
  const [root, symbolTable] = parse(tokenize(code));
  if (root !== undefined) {
    return layout(root);
  }
  return undefined;
}

export { convert };