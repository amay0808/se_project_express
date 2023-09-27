const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const unauthorizedRoutes = require("./unauthorized");
const NotFoundError = require("../errors/NotFoundError");

router.use("/", unauthorizedRoutes);

// Protected routes
router.use("/users", userRoutes);
router.use("/items", clothingItemRoutes);

// This handles all other undefined routes

router.use(() => {
  throw new NotFoundError("Route not found");
});

module.exports = router;
