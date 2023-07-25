const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");

router.use("/users", userRoutes);
router.use("/items", clothingItemRoutes);

router.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

module.exports = router;
