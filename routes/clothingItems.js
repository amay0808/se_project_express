const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  validateClothingItem,
  validateId,
} = require("../middlewares/validation"); // Adjust the path as needed
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
  getItemById,
} = require("../controllers/clothingItems");

router.get("/:id", getItemById);
router.post("/", auth, validateClothingItem, createItem);
router.get("/", getItems);
router.delete("/:itemId", auth, validateId, deleteItem);
router.put("/:itemId/likes", auth, validateId, likeItem); // Corrected the route to 'likes'
router.delete("/:itemId/likes", auth, validateId, unlikeItem); // Corrected the route to 'likes'

module.exports = router;
