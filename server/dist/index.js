"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const socket_io_1 = require("socket.io");
app.use(cors());
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
});
let game = [];
const updateClients = () => {
    for (let i = 0; i < game.length; i++) {
        const listToSend = game.filter(el => game[i].sock.id !== el.sock.id)
            .map(el => {
            return {
                nick: el.nick,
                identity: el.identity,
            };
        });
        game[i].sock.emit('update_list', listToSend);
    }
};
io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    socket.on('login', (username) => {
        socket.join('game');
        if (game.find((user) => user.nick === username)) {
            console.log('tried to login with already logged name');
            socket.emit('login_error', 'The player is already logged, try a different nickname');
            return;
        }
        game.push({ sock: socket, nick: username, identity: '' });
        console.log('player joined', username);
        socket.emit('login_successful');
        updateClients();
    });
    socket.on('setIdentity', (rsp) => {
        const { nick, identity } = rsp;
        game = game.map((player) => {
            if (player.nick === nick) {
                return Object.assign(Object.assign({}, player), { identity: identity });
            }
            return player;
        });
        updateClients();
    });
    socket.on('newGame', () => {
        game = [];
        io.emit('update_list', []);
    });
    socket.on('disconnect', () => {
        console.log('client disconnected', socket.id);
        game = game.filter(el => socket.id !== el.sock.id);
        socket.removeAllListeners();
        console.log(game);
    });
});
server.listen(3001, () => console.log('server running'));
//# sourceMappingURL=index.js.map