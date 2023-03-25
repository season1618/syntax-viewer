import './App.css';

import CodeEditor from './components/CodeEditor';
import Canvas from './components/Canvas';

function App() {
  return (
    <div id="app">
      <nav><h2>Lisp Syntax Viewer</h2></nav>
      <div id="flex"><CodeEditor /> <Canvas /></div>
    </div>
  );
}

export default App;