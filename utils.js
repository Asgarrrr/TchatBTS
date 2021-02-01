function dbSet(db) {

    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = 1");

    db.exec(
        `
        CREATE TABLE IF NOT EXISTS "channels" (
            "name"	        TEXT,
            "_ID"	        INTEGER UNIQUE,
            "Position"	    INTEGER,
            "Type"	        INTEGER,
            "desc"	        TEXT,

            PRIMARY KEY("_ID" AUTOINCREMENT)
        );

        CREATE TABLE IF NOT EXISTS "messages" (
            "_ID"	        INTEGER UNIQUE,
            "_AuthorID"	    INTEGER,
            "Content"	    TEXT,
            "_ChannelID"	INTEGER,
            "Time"	        TEXT,

            FOREIGN KEY("_ChannelID") REFERENCES "channels"("_ID"),
            FOREIGN KEY("_AuthorID") REFERENCES "users"("_ID"),
            PRIMARY KEY("_ID" AUTOINCREMENT)
        );

        CREATE TABLE IF NOT EXISTS "mp" (
            "_ID"	    INTEGER UNIQUE,
            "_from"	    INTEGER,
            "_to"	    INTEGER,
            "content"	TEXT,
            "time"	    TEXT,

            FOREIGN KEY("_to") REFERENCES "users"("_ID"),
            FOREIGN KEY("_from") REFERENCES "users"("_ID"),
            PRIMARY KEY("_ID" AUTOINCREMENT)
        );

        CREATE TABLE IF NOT EXISTS "users" (
            "_ID"	    INTEGER UNIQUE,
            "Username"	TEXT,
            "Pass"	    TEXT,
            "Avatar"	TEXT,

            PRIMARY KEY("_ID" AUTOINCREMENT)
        );
        `
    )
}

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
    dbSet,
    getUser,
    getAllChannel,
    getAllUsers,
    checkAuth,
    getChannel,
    getLastMessage,
    getMp
}