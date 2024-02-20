import './Canvas.css';
import { Node } from '../converter/layout';
import { useState, useEffect, useContext } from 'react';
import { NodeContext } from '../App';

function Canvas() {
  const [mousePressed, setMousePressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [logScale, setLogScale] = useState(0);
  const [node, setNode] = useContext(NodeContext);

  function updateMousePos(x: number, y: number) {
    if (mousePressed) {
      setOrigin({ x: origin.x + x - mousePos.x, y: origin.y + y - mousePos.y });
    }
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
      
      if (node !== undefined){
        draw(node);
      }

      function draw(node: Node) {
        let x = width * node.offset;
        let y = height * node.depth;
        drawNode(x, y, node.label);

        node.childs.forEach((child, index) => {
          let x1 = x + (index + 1) / (node.childs.length + 1) * 2 * r - r;
          let y1 = y + r;
          let x2 = width * child.offset;
          let y2 = height * child.depth - r;
          drawArrow(x1, y1, x2, y2);
        });

        node.belows.forEach((below) => {
          draw(below);
        });
      }

      function drawNode(x: number, y: number, label: string) {
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI);
        context.stroke();
        context.fillText(label, x, y);
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
    [origin, logScale, node]
  );

  return (
    <canvas
      onMouseDown={(e) => setMousePressed(true)}
      onMouseUp={(e) => setMousePressed(false)}
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