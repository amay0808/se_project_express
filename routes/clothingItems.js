const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItems");

// Create an item
router.post("/", auth, createItem);

// Get all items
router.get("/", getItems);
// Delete an item
router.delete("/:itemId", auth, deleteItem);

// Like an item
router.put("/:itemId/likes", auth, likeItem);

// Unlike an item
router.delete("/:itemId/likes", auth, unlikeItem);

module.exports = router;
