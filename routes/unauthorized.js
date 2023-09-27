const router = require("express").Router();
const { signinUser, createUser } = require("../controllers/users");
const {
  validateNewUser,
  validateUserLogin,
} = require("../middlewares/validation");

// Signup route
router.post("/signup", validateNewUser, (req, res) => {
  createUser(req, res);
});

// Signin route
router.post("/signin", validateUserLogin, (req, res) => {
  signinUser(req, res);
});

module.exports = router;
