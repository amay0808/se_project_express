const router = require("express").Router();
const {
  getUser,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

// New routes
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateCurrentUser);

// Existing route
router.get("/:userId", getUser);

module.exports = router;
