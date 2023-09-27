const router = require("express").Router();
const { signinUser, createUser } = require("../controllers/users");
const {
  validateNewUser,
  validateUserLogin,
} = require("../middlewares/validation");

// Signup route
router.post("/signup", validateNewUser, createUser);

// Signin route
router.post("/signin", validateUserLogin, signinUser);

module.exports = router;
