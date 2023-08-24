const router = require("express").Router();
const {
  getCurrentUser,
  updateCurrentUser,
  createUser,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

// New routes
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateCurrentUser);
router.post("/register", createUser); // Add this line to handle user registration

// Existing route
router.get("/:userId");

module.exports = router;
