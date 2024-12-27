const express = require("express");
const router = express.Router();
const pool = require("../db");
const utils = require("../utils");
const { BOOK_TABLE } = require("../config");

// Search book by title
router.get("/title", (request, response) => {
  const { title } = request.query;

  console.log("Searching for books with title:", title);

  const statement = `SELECT * FROM ${BOOK_TABLE} WHERE title LIKE ?`;

  pool.execute(statement, [`%${title}%`], (err, result) => {
    if (err) {
      response.send(utils.createError(err.message));
    } else {
      console.log("Query result:", result);

      if (result.length === 0) {
        response
          .status(404)
          .send(utils.createError("No books found with this title"));
      } else {
        response.send(utils.createSuccess(result));
      }
    }
  });
});

// fetch all books
router.get("/all", (request, response) => {
  const statement = `SELECT * FROM ${BOOK_TABLE}`;

  pool.execute(statement, (err, result) => {
    if (err) {
      response.send(utils.createError(err.message));
    } else {
      response.send(utils.createSuccess(result));
    }
  });
});

// add book
router.post("/add", (request, response) => {
  const { title, author, price, stock_quantity } = request.body;

  const statement = `
    INSERT INTO ${BOOK_TABLE} (title, author, price, stock_quantity)
    VALUES (?,?,?, ?)
  `;

  pool.execute(
    statement,
    [title, author, price, stock_quantity],
    (err, result) => {
      if (err) {
        response.send(utils.createError(err.message));
      } else {
        response.send(utils.createSuccess("Book added successfully..."));
      }
    }
  );
});

// fetch book by id
router.get("/:id", (request, response) => {
  const { id } = request.params;

  const statement = `SELECT * FROM ${BOOK_TABLE} WHERE book_id =?`;

  pool.execute(statement, [id], (err, result) => {
    if (err) {
      response.send(utils.createError(err.message));
    } else {
      response.send(utils.createSuccess(result[0]));
    }
  });
});

module.exports = router;
