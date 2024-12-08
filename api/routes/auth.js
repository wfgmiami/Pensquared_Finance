const router = require("express").Router();
const bcrypt = require("bcrypt");
const { query } = require("../db/pg");
const { findUserByEmail, registerUser } = require("../db/queries/authSql");

// console.log("***** ", userObj);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userObj = await query(findUserByEmail, [email]);

    const user = userObj.rows[0];

    // user will be undefined if it is not found
    !user && res.status(404).send("User not found");

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(400).json("Wrong password");
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// register an user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const userName = email.slice(0, email.indexOf("@"));

  try {
    const userObj = await query(findUserByEmail, [email]);

    if (userObj.rows.length !== 0) {
      const err = "This email already exist!";
      res.status(400).send(err);
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await query(`${registerUser}`, [
          email,
          hashedPassword,
          userName,
        ]);
        const user_id = user.rows[0].user_id;
        res.status(200).json({ user_id, userName });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
