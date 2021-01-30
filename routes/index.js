var express = require('express');
var router = express.Router();

const { getUser, getAllChannel, getAllUsers } = require("../utils")

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;


module.exports = function (io) {

    router.get('/', function(req, res, next) {

        const db = req.app.get('db');

        res.render('index', {
            title: 'Express',
            user: getUser(db, 1),
            channels: getAllChannel(db),
            users: getAllUsers(db),
        });
    });

    //Socket.IO
    io.on('connection', function (socket) {
        console.log('User has connected to Index');
        //ON Events
        socket.on('admin', function () {
            console.log('Successful Socket Test');
        });

        //End ON Events
    });
    return router;
};