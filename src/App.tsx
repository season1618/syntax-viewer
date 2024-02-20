import './App.css';
import { useState, createContext } from 'react';
import CodeEditor from './components/CodeEditor';
import Canvas from './components/Canvas';
import { Node } from './converter/layout';

const initNode: Node | undefined = undefined;
export const NodeContext = createContext<[Node | undefined, (node: Node | undefined) => void]>([initNode, (node: Node | undefined) => {}])

function App() {
  const [node, setNode] = useState<Node | undefined>(initNode);

  return (
    <div id="app">
      <nav><h2>Lisp Syntax Viewer</h2></nav>
      <div id="flex">
        <NodeContext.Provider value={[node, setNode]}>
          <CodeEditor /><Canvas />
        </NodeContext.Provider>
      </div>
    </div>
  );
}

export default App;