const express = require("express");
const router = express.Router();
const pool = require("../db");
const utils = require("../utils");
const { USER_TABLE, BOOK_TABLE, PURCHASE_TABLE } = require("../config");

// order a book
router.post("/order", (request, response) => {
  const { userId, bookId, quantity } = request.body;
  console.log("req.body: ", request.body);

  const statement = `SELECT stock_quantity, price FROM ${BOOK_TABLE} WHERE book_id =?`;
  pool.execute(statement, [bookId], (err, result) => {
    if (err) {
      return response.status(404).send(utils.createError(err));
    }

    if (result.length === 0) {
      return response.status(404).send(utils.createError("Book not found"));
    }

    const stockQuantity = result[0].stock_quantity;
    const price = result[0].price;
    console.log("stock quantity: ", stockQuantity);
    console.log("quantity: ", quantity);
    console.log("price: ", price);

    if (quantity <= stockQuantity) {
      // Step 1: Update the book stock
      const updateStatement = `
          UPDATE ${BOOK_TABLE}
          SET stock_quantity = stock_quantity - ?
          WHERE book_id = ?
        `;

      pool.execute(updateStatement, [quantity, bookId], (err, result) => {
        if (err) {
          return response.status(500).send(utils.createError(err));
        }
        console.log("update book quantity: result: " + JSON.stringify(result));

        // Step 2: Insert a record into the PURCHASE_TABLE
        const purchaseStatement = `
            INSERT INTO ${PURCHASE_TABLE} (user_id, book_id, quantity, total_price, purchase_date)
            VALUES (?, ?, ?, ?, NOW())  -- Now() to capture the current date and time
          `;

        pool.execute(
          purchaseStatement,
          [userId, bookId, quantity, quantity * price],
          (err, result) => {
            if (err) {
              console.log("purchase error: " + JSON.stringify(err));

              return response
                .status(500)
                .send(utils.createError("Error inserting into purchase table"));
            }

            console.log("result: " + JSON.stringify(result));

            response.send(utils.createSuccess("Book purchase successfully"));
          }
        );
      });
    } else {
      response.status(400).send(utils.createError("Insufficient stock"));
    }
  });
});

// Fetch all ordered books for a user by user_id
// router.get("/orders/:userId", (request, response) => {
//   const { userId } = request.params;

//   const statement = `
//     SELECT 
//       p.purchase_id,
//       b.title AS book_title,
//       b.author AS book_author,
//       p.quantity,
//       p.total_price,
//       p.purchase_date
//     FROM 
//       ${PURCHASE_TABLE} p
//     JOIN 
//       ${BOOK_TABLE} b ON p.book_id = b.book_id
//     WHERE 
//       p.user_id = ?;
//   `;

//   pool.execute(statement, [userId], (err, result) => {
//     if (err) {
//       console.log("Error fetching orders: ", err);
//       return response
//         .status(500)
//         .send(utils.createError("Error fetching orders"));
//     }

//     if (result.length === 0) {
//       return response
//         .status(404)
//         .send(utils.createError("No orders found for this user"));
//     }

//     response.send(utils.createSuccess(result));
//   });
// });

router.get("/orders/:userId", (request, response) => {
  const { userId } = request.params;

  // Validate userId
  if (isNaN(userId)) {
    return response.status(400).send(utils.createError("Invalid user ID"));
  }

  const statement = `
    SELECT 
      p.purchase_id,
      b.title AS book_title,
      b.author AS book_author,
      p.quantity,
      p.total_price,
      p.purchase_date
    FROM 
      ${PURCHASE_TABLE} p
    JOIN 
      ${BOOK_TABLE} b ON p.book_id = b.book_id
    WHERE 
      p.user_id = ?;
  `;

  pool.execute(statement, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err); // Use console.error for error logs
      return response
        .status(500)
        .send(utils.createError("Internal server error. Please try again."));
    }

    if (result.length === 0) {
      return response
        .status(404)
        .send(utils.createError("No orders found for this user"));
    }

    response.send(utils.createSuccess(result));
  });
});


module.exports = router;
