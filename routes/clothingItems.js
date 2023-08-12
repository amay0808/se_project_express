const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItems");

// Create
router.post("/", auth, createItem);

// Read
router.get("/", auth, getItems);

// Delete
router.delete("/:itemId", auth, deleteItem);

// Like
router.put("/:itemId/likes", auth, likeItem);

// Unlike
router.delete("/:itemId/likes", auth, unlikeItem);

module.exports = router;
