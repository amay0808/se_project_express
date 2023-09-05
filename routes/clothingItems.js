const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
  getItemById,
} = require("../controllers/clothingItems");

router.get("/:id", getItemById);
// Create an item
router.post("/", auth, createItem);

// Get all items
router.get("/", getItems);

// Delete an item
router.delete("/:itemId", auth, deleteItem);

// Like an item
router.put("/:itemId/like", auth, likeItem);

// Unlike an item
router.delete("/:itemId/like", auth, unlikeItem);

module.exports = router;
