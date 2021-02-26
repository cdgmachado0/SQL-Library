var express = require('express');
var router = express.Router();
const Book = require('../models/').Book;
const { Op } = require('../models/').Sequelize;


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

async function setPages() {
  const listBooks = await Book.findAll();
  const pages = Math.ceil(listBooks.length / 5);
  return pages;
}


/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('/books');
});

router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('allBooks', { books, title: 'List of Books' });
}));

router.get('/books/pages', asyncHandler(async (req, res) => {
  const pagBooks = await Book.findAll({ limit: 5 });
  const pages = await setPages();
  res.render('allBooks', { books: pagBooks, pages, pagination: true, title: 'List of Books'});
}));


router.get('/books/page-:page', asyncHandler(async (req, res) => {
  const numPages = req.params.page;
  if (numPages === '1') {
    res.redirect('/books/pages');
  } else {
    const offset = (numPages * 5) - 5;
    const books = await Book.findAll({ offset, limit: 5 });
    const pages = await setPages();
    res.render('allBooks', {title: 'Books', books, pages, pagination: true});
  }
}))


router.get('/books/new', (req, res) => {
  res.render('newBook', { title: 'New Book' });
});


router.post('/books/new', asyncHandler(async (req, res) => {
  try {
    const nextId = await getNextId();
    const newModel = req.body;
    newModel.id = nextId;
    await Book.create(newModel);
    res.redirect('/');
  } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const book = await Book.build(req.body);
        res.render('newBook', { book, title: 'New Book', error })
    } else {
      throw error;
    }
  }
}));


router.get('/books/search', asyncHandler(async (req, res) => {
  const search = req.query.search;
  const { count, rows } = await Book.findAndCountAll({
    where: {
      [Op.or]: [
        {title: { [Op.substring]: `${search}` }},
        {author: { [Op.substring]: `${search}` }},
        {genre: { [Op.substring]: `${search}` }},
        {year: { [Op.substring]: `${search}`} }
      ]
    }
  });
  res.render('allBooks', { books: rows , title: 'Book search'});
}));


router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (typeof id === 'number') {
    const book = await Book.findByPk(id);
    res.render('updateBook', { title: book.title, book });
  } else {
    next();
  }
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


router.get('/page-not-found', (req, res) => {
  const error = new Error();
  error.status = 404;
  error.message = "The page you're trying to see doesn't exist"
  res.render('page-not-found', { error });
})




module.exports = router;

