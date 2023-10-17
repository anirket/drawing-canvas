import { Draw } from "@/types/canvasTypes";

type DrawLine = {
    data: Draw,
    currentStroke: number,
    color: string,
}

export const drawLineInit = ({ data, currentStroke, color }: DrawLine) => {
    const { currentPoint, prevPoint, ctx } = data;
    const { x, y } = currentPoint;
    const lineWidth = currentStroke;

    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.arc(startPoint.x, startPoint.y, lineWidth / 2, 0, 2 * Math.PI);
    ctx.fill();
}