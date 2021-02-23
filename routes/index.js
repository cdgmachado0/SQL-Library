var express = require('express');
var router = express.Router();
const Book = require('../models/book.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  const books = await Book.findAll();
  console.log('hi');
  console.log(books.toJSON());
  res.json(books);
});

module.exports = router;
