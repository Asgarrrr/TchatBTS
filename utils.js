function getUser(db, id) {
    return db.prepare("SELECT * FROM users WHERE _ID = ?").get(id)
}

function getAllChannel(db) {
    return db.prepare("SELECT * FROM channels").all()
}

function getChannel(db, id) {
    return db.prepare("SELECT * FROM channels WHERE _ID = ?").get(id)
}

function getAllUsers(db) {
    return db.prepare("SELECT `Username`, `Avatar`, `_ID` FROM users").all()
}

function getMp(db, from, to) {
    return db.prepare("SELECT * FROM mp INNER JOIN users ON mp._from = users._ID WHERE _from = ? AND _to = ? OR _from = ? AND _to = ?").all(from, to, to, from)
}

const getLastMessage = (db, channelID) => db.prepare('SELECT * FROM messages INNER JOIN users ON messages._AuthorID = users._ID WHERE _ChannelID = ? ORDER BY _ID ASC').all(channelID);

function checkAuth(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.redirect("/auth");
    }
}



module.exports = {
    getUser,
    getAllChannel,
    getAllUsers,
    checkAuth,
    getChannel,
    getLastMessage,
    getMp
}