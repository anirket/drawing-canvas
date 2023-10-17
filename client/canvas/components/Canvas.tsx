'use client';
import useDraw from '@/hooks/useDraw';
import { Draw } from '@/types/canvasTypes';
import { drawLineInit } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const Canvas = () => {
  const [color, setColor] = useState('#000');
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [currentStroke, setCurrentStroke] = useState(5);

  const createLine = (data: Draw) => {
    const { prevPoint, currentPoint } = data;
    socket.emit('draw-line', { prevPoint, currentPoint, color, currentStroke });
    drawLineInit({ data, currentStroke, color });
  };

  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    socket.emit('client-ready')

    socket.on('get-client-state', () => {
      socket.emit('canvas-state', canvasRef.current?.toDataURL());  
    })

    socket.on('canvas-state-from-server',  (canvasRef) => {
      const img = new Image();
      img.src = canvasRef;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })

    socket.on('draw-line', ({ prevPoint, currentPoint, color, currentStroke: strokeLength }) => {
      if (ctx) {
        const data = {
          ctx,
          currentPoint,
          prevPoint,
        };
        drawLineInit({ data, currentStroke: strokeLength, color });
      }
    });
    socket.on('clear', () => {
      clear()
    })

    return () => {
      socket.off('draw-line')
      socket.off('clear')
      socket.off('canvas-state-from-server')
      socket.off('get-client-state')
    }
  }, [canvasRef, currentStroke, clear]);

  const clearCanvas = () => {
    clear()
    socket.emit('clear')
  }

  const numberOfStrokes = [
    {
      key: 5,
      className: 'h-[5px]',
    },
    {
      key: 10,
      className: 'h-[10px]',
    },
    {
      key: 15,
      className: 'h-[15px]',
    },
  ];


  // adding this overhead instead of CSS responsive because Canvas is not getting points correctly on responsive CSS
  const isDesktopWindow =
    typeof window !== 'undefined' ? window.innerWidth > 991 : true;

  useEffect(() => {
    setIsDesktop(isDesktopWindow);
  }, [isDesktopWindow]);

  return (
    <>
      <div className="m-7 flex flex-col justify-center items-center h-screen bg-white md:m-0 md:flex-row overflow-y-hidden md:overflow-y-auto">
        <div className="order-2 md:order-1 mt-10 md:mt-0 md:mr-10 flex justify-around items-center w-[350px] md:h-[500px] md:flex-col">
          <SketchPicker color={color} onChange={(e) => setColor(e.hex)} />
          <div className="flex flex-col justify-around">
            <div className="w-[80px] md:w-[200px] mb-10 border-2 h-[100px] flex flex-col justify-around items-center cursor-pointer relative md:mt-10">
              {numberOfStrokes.map((stroke) => (
                <div
                  key={stroke.key}
                  className="p-2 w-[90%]"
                  onClick={() => setCurrentStroke(stroke.key)}
                >
                  <div
                    className={`${stroke.className} ${
                      currentStroke === stroke.key ? 'bg-black' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <button
              className="bg-black h-10 text-white w-[80px] rounded-lg md:w-[200px]"
              onClick={clearCanvas}
            >
              Clear
            </button>
          </div>
        </div>
        <canvas
          width={isDesktop ? 750 : 300}
          height={isDesktop ? 750 : 300}
          onMouseDown={onMouseDown}
          ref={canvasRef}
          className="border border-black rounded-xl order-1"
        ></canvas>
      </div>
    </>
  );
};

export default Canvas;
