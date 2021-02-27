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

//Assigns the next ID in queue to the new created model
async function getNextId() {
  const idsArr = [];
  const books = await Book.findAll();
  for (let book of books) {
    const id = book.dataValues.id;
    idsArr.push(id);
  }
  return Math.max(...idsArr) + 1;
}

//Sets the number of pages to be created for pagination
async function setPages() {
  const listBooks = await Book.findAll();
  const pages = Math.ceil(listBooks.length / 5);
  return pages;
}


/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('/books');
});


//Full-list router
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('allBooks', { books, title: 'List of Books' });
}));


//Paginantion-list router
router.get('/books/pages', asyncHandler(async (req, res) => {
  const pagBooks = await Book.findAll({ limit: 5 });
  const pages = await setPages();
  res.render('allBooks', { books: pagBooks, pages, pagination: true, title: 'List of Books'});
}));


//Handles the division of books per selected page
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


//Gets the view for adding a new book to the database
router.get('/books/new', (req, res) => {
  res.render('newBook', { title: 'New Book' });
});


//Adds a new book to the database
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


//Handles the dynamic search of books through the Search Bar
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


//Gets the details of a particular book
router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findByPk(id);
  if (typeof +id === 'number' && book) {
    res.render('updateBook', { title: book.title, book });
  } else {
    next();
  }
}));


//Handles the update of a particular book in the database
router.post('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/');
}));


//Deletes a particular book from the database
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/');
}));


//Render the page-not-found view
router.get('/page-not-found', (req, res) => {
  const error = new Error();
  error.status = 404;
  error.message = "The page you're trying to see doesn't exist"
  res.render('page-not-found', { error });
})



module.exports = router;

