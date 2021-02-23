var express = require('express');
var router = express.Router();
const Book = require('../models/').Book;


function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      console.error('Error while connecting to the database: ', error);
    }
  }
}

/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('/books');
});

router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('allBooks', { books });
}));



module.exports = router;

// res.render('index', {title: 'hello world'});
