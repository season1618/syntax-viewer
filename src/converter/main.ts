import { tokenize } from './lexer';
import { parse } from './parser';
import { Node } from './layout';

function convert(code: string): Node | undefined {
  const ast = parse(tokenize(code));
  if (ast !== undefined) {
    const node = Node.build(ast);
    node.calcBelows();
    node.calcOffset();
    return node;
  }
  return undefined;
}

export { convert };