import './Canvas.css';
import { useState, useEffect } from 'react';

function Canvas() {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  
  useEffect(
    () => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      setContext(ctx);
    },
    []
  );

  return (
    <canvas></canvas>
  )
}

export default Canvas;