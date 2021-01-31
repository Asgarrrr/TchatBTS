const { log } = require('console');
var express = require('express');
var router = express.Router();

const { getMp, getUser, checkAuth } = require("../utils")

module.exports = function (io, db) {

    router.post('/:id', checkAuth, function (req, res, next) {

        const user = getUser(db, req.params.id)

        if (!user)
            res.status(404).send('No user found');

        res.render("mp", {
            old: getMp(db, req.params.id, req.session.user._ID),
            user: getUser(db, req.params.id)
        });

    });

    return router;
};