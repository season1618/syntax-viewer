import { tokenize } from './lexer';
import { parse } from './parser';
import { Node } from './layout';

function convert(code: string): Node | undefined {
  const ast = parse(tokenize(code));
  if (ast !== undefined) {
    const tree = Node.build(ast);
    tree.calcDepth();
    tree.calcBelows();
    tree.calcOffset();
    tree.calcAbsolute();
    return tree;
  }
  return undefined;
}

export { convert };