import './Canvas.css';
import { useEffect, useContext } from 'react';
import { TreeContext } from '../App';

function Canvas() {
  const [tree, setTree] = useContext(TreeContext);
  useEffect(
    () => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.beginPath();
      context.arc(0, 0, 100, 0, 2 * Math.PI);
      context.stroke();
    },
    []
  );

  useEffect(
    () => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    [tree]
  )

  return (
    <canvas></canvas>
  )
}

export default Canvas;