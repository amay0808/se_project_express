const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const unauthorizedRoutes = require("./unauthorized");
const { NOT_FOUND } = require("../utils/errors");

router.use("/auth", unauthorizedRoutes);

// Protected routes

router.use("/users", userRoutes);
router.use("/items", clothingItemRoutes);

// This handles all other undefined routes
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Route not found" });
});

module.exports = router;
