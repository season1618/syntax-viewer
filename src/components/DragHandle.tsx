import './DragHandle.css';
import { useState, useContext } from 'react';
import { DragContext, BorderContext } from '../App';

function DragHandle() {
  const [dragged, setDragged] = useContext(DragContext);
  const [borderX, setBorderX] = useContext(BorderContext);

  return (
    <div id="draghandle"
      style={{left: borderX}}
      onMouseDown={(e) => setDragged(true)}
      onMouseUp={(e) => setDragged(false)}
    ></div>
  );
}

export default DragHandle;