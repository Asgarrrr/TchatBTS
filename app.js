// ██████ Integrations ████████████████████████████████████████████████████████

const createError = require('http-errors')
    , express = require('express')
    , path = require('path')
    , cookieParser = require('cookie-parser')
    , SQLite = require("better-sqlite3")
    , logger = require('morgan');


var app = express();

app.io = require('socket.io')();
app.set("db", new SQLite('./database.sqlite'))

app.io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

var routes = require('./routes/index')(app.io);

app.use('/', routes);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
