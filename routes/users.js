const router = require("express").Router();

const {
  getCurrentUser,
  updateCurrentUser,
  createUser,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateCurrentUser);
router.post("/register", createUser);

router.get("/:userId");

module.exports = router;
