var express = require('express');
var router = express.Router();
const Book = require('../models').Book;


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
router.get('/', asyncHandler( (req, res) => {
  res.render('index', { title: 'Express' });
  // const books = await Book.findAll();
  // console.log('hi');
  // console.log(books.toJSON());
  // res.json(books);
}));

module.exports = router;
