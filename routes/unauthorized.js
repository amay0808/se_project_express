const router = require("express").Router();
const { signinUser, createUser } = require("../controllers/users");

// Signup route
router.post("/signup", (req, res) => {
  createUser(req, res);
});

// Signin route
router.post("/signin", (req, res) => {
  signinUser(req, res);
});

module.exports = router;
