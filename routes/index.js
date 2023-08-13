const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const { signinUser, createUser } = require("../controllers/users");
const { NOT_FOUND } = require("../utils/errors");
const auth = require("../middlewares/auth");

// Public routes
router.post("/signin", signinUser);
router.post("/signup", createUser);

// Protected routes (add the auth middleware directly to these routes)
router.use("/items", auth, clothingItemRoutes);
router.use("/users", auth, userRoutes);

// This handles all other undefined routes
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Route not found" });
});

module.exports = router;
