const router = require("express").Router();
const { validateUpdateCurrentUser } = require("../middlewares/validation"); // Import the new validation schema

const { getCurrentUser, updateCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateCurrentUser, updateCurrentUser); // Added the validation middleware

module.exports = router;
