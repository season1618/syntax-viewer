import './App.css';
import { useState, createContext } from 'react';
import CodeEditor from './components/CodeEditor';
import Canvas from './components/Canvas';
import DragHandle from './components/DragHandle';
import { Node } from './converter/layout';

const initNode: Node | undefined = undefined;
export const NodeContext = createContext<[Node | undefined, (node: Node | undefined) => void]>([initNode, (node: Node | undefined) => {}])
export const DragContext = createContext<[boolean, (dragged: boolean) => void]>([false, (dragged: boolean) => {}])
export const BorderContext = createContext<[number, (borderX: number) => void]>([0, (borderX: number) => {}])

function App() {
  const [dragged, setDragged] = useState<boolean>(false);
  const [borderX, setBorderX] = useState<number>(window.innerWidth / 2);
  const [node, setNode] = useState<Node | undefined>(initNode);

  return (
    <div id="app">
      <nav><h2>Lisp Syntax Viewer</h2></nav>
      <div id="flex"
        onMouseMove={
          (e) => {
            if (dragged) {
              setBorderX(e.clientX);
            }
          }
        }
      >
        <DragContext.Provider value={[dragged, setDragged]}>
          <BorderContext.Provider value={[borderX, setBorderX]}>
            <NodeContext.Provider value={[node, setNode]}>
              <CodeEditor /><DragHandle /><Canvas />
            </NodeContext.Provider>
          </BorderContext.Provider>
        </DragContext.Provider>
        
      </div>
    </div>
  );
}

export default App;