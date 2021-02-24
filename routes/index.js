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

async function getNextId() {
  const idsArr = [];
  const books = await Book.findAll();
  for (let book of books) {
    const id = book.dataValues.id;
    idsArr.push(id);
  }
  return Math.max(...idsArr) + 1;
}


/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('/books');
});

router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('allBooks', { books, title: 'Books'});
}));

router.get('/books/new', (req, res) => {
  res.render('newBook', { title: 'New Book' });
});

router.post('/books/new', asyncHandler(async (req, res) => {
  const nextId = await getNextId();
  const newModel = req.body;
  newModel.id = nextId;
  await Book.create(newModel);
  res.redirect('/');
}));

router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render('updateBook', { title: book.title, book });
}));

router.post('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/');
}));

router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/');
}));




module.exports = router;

// res.render('index', {title: 'hello world'});
