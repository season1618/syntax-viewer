import './App.css';
import { useState, createContext } from 'react';
import CodeEditor from './components/CodeEditor';
import Canvas from './components/Canvas';
import { Expr } from './converter/parser';

// export const TreeContext = createContext<Expr>({ kind: 'prim', value: '' });
const initExpr: Expr = { kind: 'prim', value: '' };
export const TreeContext = createContext<[Expr, (expr: Expr) => void]>([initExpr, (expr: Expr) => {}])

function App() {
  const [tree, setTree] = useState<Expr>(initExpr);

  return (
    <div id="app">
      <nav><h2>Lisp Syntax Viewer</h2></nav>
      <div id="flex">
        <TreeContext.Provider value={[tree, setTree]}>
          <CodeEditor /><Canvas />
        </TreeContext.Provider>
      </div>
    </div>
  );
}

export default App;