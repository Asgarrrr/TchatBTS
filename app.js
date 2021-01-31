// ██████ Integrations ████████████████████████████████████████████████████████

// —— provides utilities for working with file and directory paths
const path          = require('path')
// —— HTTP request logger middleware for node.
    , logger        = require('morgan')
// —— The fastest and simplest library for SQLite3 in Node.
    , SQLite        = require("better-sqlite3")
// —— Fast, unopinionated, minimalist web framework for node.
    , express       = require('express')
// —— Simple session middleware for Express
    , session       = require("express-session")
// —— Create HTTP error objects
    , createError   = require('http-errors')
// —— Parse HTTP request cookies
    , cookieParser  = require('cookie-parser');
const user = require('./routes/user');

// —— Creates and/or instantiates a new SQLite connection
const db = new SQLite('./database.sqlite')
// —— Creates a new instance of express

//     , server = app.listen("3000", () => {
//         console.log("Listening on port: 3000");
//     })
// // —— Socket.IO enables real-time bidirectional event-based communication
//     , socket        = require('socket.io')(server)



//app.io = socket;


// ██████ Routes ██████████████████████████████████████████████████████████████

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const indexRoutes   = require('./routes/index')(io, db)
    , authRoutes    = require('./routes/auth')(io, db)
    , channelRoutes = require('./routes/channel')(io, db)
    , userRoutes = require('./routes/user')(io, db);


app.set("io", io);
// ██████ Express ████████████████████████████████████████████████████████████

// —— View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// —— Set morgan logger
app.use(logger('dev'));

// —— Trust first proxy
app.set('trust proxy', 1);

// —— Session middleware
var sessionMiddleware = session({
    secret: 'Shuttttt !',
    resave: false,
    saveUninitialized: true,
})

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use(sessionMiddleware);


// —— Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.
app.use(express.json());

// —— Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option
app.use(express.urlencoded({ extended: false }));

// —— Json parser
app.use(cookieParser());

app.use("/jquery", express.static(path.join(__dirname, "../node_modules/jquery/dist/")))

app.use(express.static(path.join(__dirname, 'public')));

// —— Route additions
app.use('/'         , indexRoutes);
app.use('/auth'     , authRoutes);
app.use('/channel'  , channelRoutes);
app.use('/user'     , userRoutes);

// —— Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// —— Error handler
app.use(function(err, req, res, next) {
  // —— Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // —— Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app: app, server: server };