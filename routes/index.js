const router = require("express").Router();
const userRoutes = require("./users");
const clothingItemRoutes = require("./clothingItems");
const { NOT_FOUND } = require("../utils/errors");

router.use("/users", userRoutes);
router.use("/items", clothingItemRoutes);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Route not found" });
});

module.exports = router;
