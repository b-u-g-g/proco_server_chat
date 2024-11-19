const express = require('express');
const morgan = require('morgan');
const app = express()
const port = 3000

app.use(morgan('tiny'));

app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, 'localhost', () => console.log(`Example app listening on port ${port}!`))

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        // localhost
        origin: "https://f31d-101-44-82-234.ngrok-free.app"
        // hosted server
        // origin: "https://jobhubbackend-production.up.railway.app/"
    }
});

io.on("connection", (socket) => {
    console.log("connected to sockets");

    socket.on('setup', (userId) => {
        socket.join(userId);
        socket.broadcast.emit('online-user', userId)
        console.log(userId);
    });


    socket.on('typing', (room) => {
        // console.log("typing");
        // console.log("room");
        socket.to(room).emit('typing', room)
    });


    socket.on('stop typing', (room) => {
        // console.log("stop typing");
        // console.log("room");
        socket.to(room).emit('stop typing', room)
    });


    socket.on('join chat', (room) => {
        socket.join(room)
        // console.log('User Joined : ' + room);
    });

    socket.on('new message', (newMessageReceived) => {
        console.log("hit");
        var chat = newMessageReceived.chat;
        var room = chat._id;

        var sender = newMessageReceived.sender;
        console.log(sender);
        if (!sender || sender._id) {
             console.log('Sender not defined');
            //return;
        }
        console.log("hit2");
        var senderId = sender._id;
        // console.log(senderId + "message sender");
        const users = chat.users;
        console.log("hit3");
        // if (!users) {
        //     // console.log(" Users not defined");
        //     return;
        // }
        console.log("again");
        console.log(newMessageReceived["content"]);
        socket.to(room).emit('message received', newMessageReceived);
        socket.to(room).emit('message sent', "New Message");
        
    });


    socket.off('setup', () => {
        // console.log('user offline');
        socket.leave(userId)
    })


})