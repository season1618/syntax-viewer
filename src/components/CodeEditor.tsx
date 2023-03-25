import './CodeEditor.css';
import { useState, useEffect } from 'react';

type Token = OpenPar | ClosePar | Ident | Number;

interface OpenPar {
  kind: 'openpar';
}

interface ClosePar {
  kind: 'closepar';
}

interface Ident {
  kind: 'ident';
  ident: string;
}

interface Number {
  kind: "number";
  value: number;
}

function CodeEditor() {
  const [code, setCode] = useState('');
  const [cursorPos, setCursorPos] = useState(-1);
  const indent = 4;
  const target = document.querySelector('textarea') as HTMLTextAreaElement;

  // function push() {
  //   if (task !== '') {
  //     setTaskList(taskList.concat([task]));
  //     setTask('');
  //   }
  // }

  useEffect(
    () => {
      if (cursorPos === -1) return;
      target.focus();
      target.setSelectionRange(cursorPos, cursorPos);
    },
    [target, code, cursorPos]
  );

  function format(pos: number, nextCode: string) {
    pos -= 1;
    if (code.length < nextCode.length) {
      if (nextCode[pos] === '(' && pos === nextCode.length - 1) {
        nextCode = nextCode.concat(')');
      }

      if (nextCode[pos] === '\'' && nextCode[pos-1] !== '\'' && nextCode[pos+1] !== '\'') {
        nextCode = nextCode.substring(0, pos) + '\'' + nextCode.substring(pos, nextCode.length);
      }

      if (nextCode[pos] === '\t') {
        nextCode = nextCode.replace('\t', ' '.repeat(indent));
      }
    }

    setCode(nextCode);
    setCursorPos(pos + 1);
  }

  function formatTab(pos: number) {
    let nextCode = code.substring(0, pos) + ' '.repeat(indent) + code.substring(pos, code.length);
    setCode(nextCode);
    setCursorPos(pos + indent);
  }

  // function tokenize(code: string): Token[] {
  //   let i = 0;
  //   while (i < code.length) {
  //     if 
  //   }
  // }

  return (
    <div>
      <h1>Lisp Syntax Viewer</h1>
      <textarea
        value={code}
        onChange={(e) => { format(e.target.selectionStart, e.target.value);} }
        onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); const target = e.target as HTMLTextAreaElement; formatTab(target.selectionStart);}}}
      />
    </div>
  );
}

export default CodeEditor;