const router = require("express").Router();
const {
  getUser,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/users");

// New routes
router.get("/me", getCurrentUser); // Get the currently logged-in user
router.patch("/me", updateCurrentUser); // Update the currently logged-in user's profile

// Existing route
router.get("/:userId", getUser);

module.exports = router;
