const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('./'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/GB', (req, res) => {
    res.sendFile(__dirname + '/GB.html');
});

var congCount = 0;

io.on('connection', (socket) => {
    io.emit('update count', congCount);
    io.emit('update GB', guestBook);
})

var congIp = [];
var guestBook = [];

function checkCallingOverflow(socket, COOL_DOWN){
    let ip = socket.handshake.address;
    if(congIp.includes(ip)){
        io.emit('warn', socket.id);
        return false;
    }

    congIp.push(ip);
    setTimeout(() => { congIp.splice(congIp.indexOf(ip, 1))}, COOL_DOWN * 1000);
    return true;
}

io.on('connection', (socket) => {

    socket.on('register', (packet) => {
        if(!checkCallingOverflow(socket, 10)) return;

        guestBook.push({name: packet.name, content: packet.content});
    });

    socket.on('congratulation', () => {
        if(!checkCallingOverflow(socket, 1)) return;

        congCount++;
        io.emit('update count', congCount);
    });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});