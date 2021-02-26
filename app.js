var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { errorMonitor } = require('events');
const { EEXIST } = require('constants');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to page-not-found view
app.use((req, res) => {
  res.redirect('/page-not-found');
});

// error handler
app.use((err, req, res, next) => {
  if (!err.status) {
    err.status = 500;
    err.message = 'Sorry! There was an unexpected error on the server';
    console.log(err.status, err.message);
    res.render('error', { error: err });
  }
});


module.exports = app;
