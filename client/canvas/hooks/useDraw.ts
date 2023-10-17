"use client"
import { Draw, Point } from '@/types/canvasTypes';
import { useEffect, useRef, useState } from 'react'


const useDraw = (onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
    const [mouseDown, setMouseDown] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prevPoint = useRef<Point | null>(null);

    const computePointInCanvas = (e: MouseEvent) => {
        if (canvasRef.current) {
            const rect = canvasRef.current?.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return { x, y }
        }
        return { x: 0, y: 0 }
    }

    const handler = (event: MouseEvent) => {
        if (!mouseDown) {
            return;
        }
        const currentPoint = computePointInCanvas(event);
        const ctx = canvasRef.current?.getContext('2d')

        if (!ctx) {
            return null;
        }
        onDraw({ currentPoint, ctx, prevPoint: prevPoint.current })
        prevPoint.current = currentPoint;
    }

    const clear = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    const onMouseDown = () => {
        setMouseDown(true);
    }
    const mouseUpHandler = () => {
        setMouseDown(false)
        prevPoint.current = null;
    }

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.addEventListener('mousemove', handler)
        }
        const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect();
        window.addEventListener('mouseup', mouseUpHandler)

        return () => {
            canvasRef.current?.removeEventListener('mousemove', handler)
            window.removeEventListener('mouseup', mouseUpHandler)
        }
    }, [onDraw])


    return { canvasRef, onMouseDown, clear }

}

export default useDraw