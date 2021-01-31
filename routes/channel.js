const { log } = require('console');
var express = require('express');
var router = express.Router();

const { getChannel, getLastMessage, checkAuth } = require("../utils")

module.exports = function (io, db) {

    router.post('/:id', checkAuth, function (req, res, next) {

        const channel = getChannel(db, req.params.id)

        if (!channel)
            res.status(404).send('No channel found');

        res.render("channel", {
            old: getLastMessage(db, req.params.id),
            channel: channel
        });

    });

    return router;
};