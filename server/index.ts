const express = require('express')
import { Server } from 'socket.io'
const http = require('http')

const app = express();
const server = http.createServer(app);

type Draw = {
    color: string
    currentPoint: Point
    prevPoint: Point | null
    currentStroke: number
}

type Point = { x: number; y: number }


const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket) => {
    socket.on('draw-line', ({ prevPoint, currentPoint, color, currentStroke }: Draw) => {
        socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color, currentStroke })
    })
    socket.on('clear', () => {
        io.emit('clear')
    })
    socket.on('client-ready', () => {
        socket.broadcast.emit('get-client-state')
    })

    socket.on('canvas-state', (canvasRef) => {
        socket.broadcast.emit('canvas-state-from-server',  canvasRef)
    });  


})

server.listen(4000)