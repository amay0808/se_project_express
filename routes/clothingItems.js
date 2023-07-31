const router = require("express").Router();

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItems");
// CRUD

// Create
router.post("/", createItem);

// Read
router.get("/", getItems);

// Delete
router.delete("/:itemId", deleteItem);

// Like
router.put("/:itemId/likes", likeItem);

// unlike

router.delete("/:itemId/likes", unlikeItem);

module.exports = router;
