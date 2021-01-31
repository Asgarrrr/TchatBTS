const { log } = require('console');
var express = require('express');
var router = express.Router();

const { getUser, getAllChannel, getAllUsers, checkAuth } = require("../utils")

module.exports = function (io, db) {

    router.get('/', checkAuth, function(req, res, next) {

        res.render('index', {
            title: 'Express',
            user: getUser(db, req.session.user._ID),
            channels: getAllChannel(db),
            users: getAllUsers(db),
        });

    });


    io.on('connection', function (socket) {

        if (!socket.request.session.user)
            return;

        const user = socket.request.session.user

        socket.on('room', function(room) {
            socket.join(room);
            user.room = room
        });

        socket.on('mpRoom', function(room) {
            socket.join("mp"+room);
            user.room = "mp"+room
        });



        socket.on('roomMessage', function (msg) {

            const time = new Date().toString();

            io.in(user.room).emit('roomMessage', {
                timestamp   : time,
                content     : msg.content,
                user        : user,
            });

            db.prepare('INSERT INTO messages ("_AuthorID", "Content", "_ChannelID", "Time") VALUES (?, ?, ?, ?)').run(
                user._ID, msg.content, msg.room, time
            );

        });

        socket.on("roomPrivate", function (msg){

            const time = new Date().toString();

            io.in(user.room).emit('roomPrivate', {
                timestamp   : time,
                content     : msg.content,
                user        : user,
            });

        })







        // socket.on('chatMessage', function (msg) {

        //     console.log("New message")

        //     const time = new Date().toString();

        //     msg.time = time;

        //     db.prepare('INSERT INTO messages ("_AuthorID", "Content", "_ChannelID", "Time") VALUES (?, ?, ?, ?)').run(
        //         user._ID, msg.content, msg.channel, time
        //     );

        //     console.log("sendMessage");

        //     io.emit('sendMessage', {
        //         user: user,
        //         msg: msg,
        //     })

        // })

        // socket.on('privateMessage', function(msg) {

        //     const time = new Date().toString();

        //     msg.time = time;

        //     db.prepare('INSERT INTO mp ("_from", "_to", "content", "Time") VALUES (?, ?, ?, ?)').run(
        //         user._ID, msg.channel, msg.content, time
        //     );

        //     io.emit('sendMP', {
        //         user: user,
        //         msg: msg,
        //     })
        // })


    });
    return router;
};