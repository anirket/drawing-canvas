const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket) => {
    socket.on('draw-line', ({ prevPoint, currentPoint, color, currentStroke }) => {
        socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color, currentStroke })
    })
    socket.on('clear', () => {
        io.emit('clear')
    })
    socket.on('client-ready', () => {
        socket.broadcast.emit('get-client-state')
    })

    socket.on('canvas-state', (canvasRef) => {
        socket.broadcast.emit('canvas-state-from-server', canvasRef)
    });


})

server.listen(4000)