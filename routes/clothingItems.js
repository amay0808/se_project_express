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

// Read - Making this route public as per the reviewer's comment
router.get("/", getItems);

// Delete
router.delete("/:itemId", auth, deleteItem);

// Like
router.put("/:itemId/likes", auth, likeItem);

// Unlike
router.delete("/:itemId/likes", auth, unlikeItem);

module.exports = router;
