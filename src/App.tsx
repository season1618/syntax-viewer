import './App.css';
import { useState, createContext } from 'react';
import CodeEditor from './components/CodeEditor';
import Canvas from './components/Canvas';
import { AST, SymbolTable } from './converter/parser';

const initAST: AST = [undefined, new SymbolTable()];
export const AstContext = createContext<[AST, (ast: AST) => void]>([initAST, (ast: AST) => {}])

function App() {
  const [ast, setAST] = useState<AST>(initAST);

  return (
    <div id="app">
      <nav><h2>Lisp Syntax Viewer</h2></nav>
      <div id="flex">
        <AstContext.Provider value={[ast, setAST]}>
          <CodeEditor /><Canvas />
        </AstContext.Provider>
      </div>
    </div>
  );
}

export default App;