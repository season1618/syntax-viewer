import './Canvas.css';
import { Expr } from '../converter/parser';
import { useState, useEffect, useContext } from 'react';
import { AstContext } from '../App';

function Canvas() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [logScale, setLogScale] = useState(0);
  const [ast, setAST] = useContext(AstContext);

  function updateMousePos(x: number, y: number) {
    setMousePos({ x, y });
  }

  function updateScale(delta: number) {
    let nextX = mousePos.x + Math.pow(1.1, delta/100) * (origin.x - mousePos.x);
    let nextY = mousePos.y + Math.pow(1.1, delta/100) * (origin.y - mousePos.y);
    let nextLogScale = logScale + delta / 100;
    if (-50 < nextLogScale && nextLogScale < 50) {
      setOrigin({ x: nextX, y: nextY });
      setLogScale(nextLogScale);
    }
  }

  useEffect(
    () => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.font = '20px Consolas';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
    },
    []
  );

  useEffect(
    () => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      
      context.resetTransform();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.translate(origin.x, origin.y);
      context.scale(Math.pow(1.1, logScale), Math.pow(1.1, logScale));

      const width = 80;
      const height = 120;
      const r = 24; // radius of node
      const s = 3; // scale of triangle

      const [root, symbolTable] = ast;

      for (const symbol of symbolTable.table) {
        let x = width * symbol.offset;
        let y = height * symbol.depth;

        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI);
        context.stroke();
        context.fillText(symbol.name, x, y);

        draw(symbol.value);

        let x1 = x;
        let y1 = y + r;
        let x2 = width * symbol.value.getOffset();
        let y2 = height * symbol.value.getDepth() - r;
        drawArrow(x1, y1, x2, y2);
      }
      
      if (root !== undefined){
        draw(root);
      }

      function draw(expr: Expr) {
        let x = width * expr.getOffset();
        let y = height * expr.getDepth();
        
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI);
        context.stroke();
        context.fillText(expr.label, x, y);

        switch (expr.kind) {
          case 'call':
            let num = expr.args.length;
            expr.args.forEach((child, index) => {
              draw(child);

              let x1 = x + (index + 1) / (num + 1) * 2 * r - r;
              let y1 = y + r;
              let x2 = width * child.getOffset();
              let y2 = height * child.getDepth() - r;
              drawArrow(x1, y1, x2, y2);
            });
            break;
        }
      }

      function drawArrow(x1: number, y1: number, x2: number, y2: number) {
        context.beginPath();

        context.moveTo(x1, y1);
        context.lineTo(x1 - s, y1 + Math.sqrt(3) * s);
        context.lineTo(x1 + s, y1 + Math.sqrt(3) * s);
        context.closePath();
        context.fill();

        context.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
        context.stroke();
      }
    },
    [origin, logScale, ast]
  );

  return (
    <canvas
      onMouseMove={
        (e) => {
          let target = e.currentTarget.getBoundingClientRect();
          updateMousePos(e.clientX - target.left, e.clientY - target.top);
        }
      }
      onWheel={(e) => updateScale(-e.deltaY)}
    ></canvas>
  )
}

export default Canvas;