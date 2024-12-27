const express = require("express");
const router = express.Router();
const pool = require("../db");
const utils = require("../utils");
const { USER_TABLE } = require("../config");

router.post("/register", (request, response) => {
  const { first_name, last_name, email, password } = request.body;

  const statement = `INSERT INTO ${USER_TABLE}
  (first_name, last_name, email, password) VALUES(?,?,?,?)`;

  pool.execute(
    statement,
    [first_name, last_name, email, password],
    (err, result) => {
      if (err) response.send(utils.createError(err.message));
      else response.send(utils.createSuccess("registered successfully..."));
    }
  );
});

router.post("/login", (request, response) => {
  const { email, password } = request.body;

  const statement = `SELECT 
      user_id, first_name, last_name, email 
      FROM ${USER_TABLE}
      WHERE email =? AND password =?`;

  pool.execute(statement, [email, password], (err, users) => {
    if (err) response.send(utils.createError(err));
    else {
      if (users.length == 0) response.send(utils.createError("No user found"));
      else {
        const { user_id, first_name, last_name, email } = users[0];

        response.send(
          utils.createSuccess({
            user_id,
            first_name,
            last_name,
            email,
          })
        );
      }
    }
  });
});

module.exports = router;