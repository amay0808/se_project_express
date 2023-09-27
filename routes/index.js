const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const unauthorizedRoutes = require("./unauthorized");

router.use("/", unauthorizedRoutes);

// Protected routes
router.use("/users", userRoutes);
router.use("/items", clothingItemRoutes);

// This handles all other undefined routes
const { NotFoundError } = require("../errors/NotFoundError"); // Corrected

router.use(() => {
  throw new NotFoundError("Route not found");
});

module.exports = router;
