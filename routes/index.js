const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const unauthorizedRoutes = require("./unauthorized"); // Import the new unauthorizedRoutes
const { NOT_FOUND } = require("../utils/errors");

// Apply the new unauthorized routes under /auth
router.use("/auth", unauthorizedRoutes);

// Protected routes
// ... (you might add middleware for authentication here)
router.use("/users", userRoutes);
router.use("/items", clothingItemRoutes);

// This handles all other undefined routes
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Route not found" });
});

module.exports = router;
