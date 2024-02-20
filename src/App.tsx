import './App.css';
import { useState, createContext } from 'react';
import CodeEditor from './components/CodeEditor';
import Canvas from './components/Canvas';
import { Ast, SymbolTable } from './converter/parser';

const initAST: Ast | undefined = undefined;
export const AstContext = createContext<[Ast | undefined, (ast: Ast | undefined) => void]>([initAST, (ast: Ast | undefined) => {}])

function App() {
  const [ast, setAST] = useState<Ast | undefined>(initAST);

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