import './Canvas.css';
import { useState, useEffect, useRef } from 'react';

function Canvas() {
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

  return (
    <canvas></canvas>
  )
}

export default Canvas;