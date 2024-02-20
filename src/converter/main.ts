import { tokenize } from './lexer';
import { Ast, parse } from './parser';
import { Node, layout } from './layout';

function convert(code: string): Node | undefined {
  const [ast, symbolTable] = parse(tokenize(code));
  if (ast !== undefined) {
    const node = layout(ast);
    node.calcOffset();
    return node;
  }
  return undefined;
}

export { convert };