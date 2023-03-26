import './CodeEditor.css';
import { useState, useEffect, useContext } from 'react';
import { TreeContext } from '../App';
import { convert } from '../converter/main';

function CodeEditor() {
  const [code, setCode] = useState('');
  const [cursorPos, setCursorPos] = useState(-1);
  const [tree, setTree] = useContext(TreeContext);
  const indent = 4;
  const target = document.querySelector('textarea') as HTMLTextAreaElement;

  useEffect(
    () => {
      if (cursorPos === -1) return;
      target.focus();
      target.setSelectionRange(cursorPos, cursorPos);
    },
    [target, code, cursorPos]
  );

  useEffect(
    () => {
      const nextTree = convert(code);
      if (nextTree !== undefined) {
        setTree(nextTree);
      }
    },
    [code]
  )

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

  return (
    <div id="editor">
      <textarea
        value={code}
        onChange={
          (e) => {
            format(e.target.selectionStart, e.target.value);
          }
        }
        onKeyDown={
          (e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const target = e.target as HTMLTextAreaElement;
              formatTab(target.selectionStart);
            }
          }
        }
      />
    </div>
  );
}

export default CodeEditor;