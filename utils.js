function getUser(db, id) {
    return db.prepare("SELECT * FROM users WHERE _ID = ?").get(id)
}

function getAllChannel(db) {
    return db.prepare("SELECT * FROM channels").all()
}

function getAllUsers(db) {
    return db.prepare("SELECT `Username`, `Avatar`, `_ID` FROM users").all()
}

module.exports = {
    getUser,
    getAllChannel,
    getAllUsers
}