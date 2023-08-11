const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const { signinUser, createUser } = require("../controllers/users");
const { NOT_FOUND } = require("../utils/errors");
const auth = require("../middlewares/auth");

// Public routes
router.post("/signin", signinUser);
router.post("/signup", createUser);

// Middleware for protected routes
router.use(auth);

router.use("/items", clothingItemRoutes);
router.use("/users", userRoutes);

// This handles all other undefined routes
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Route not found" });
});

module.exports = router;
