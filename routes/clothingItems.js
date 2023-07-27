const router = require("express").Router();

const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem, // newly imported function
  unlikeItem,
} = require("../controllers/clothingItems");
// CRUD

// Create
router.post("/", createItem);

//Read
router.get("/", getItems);

//Update
router.put("/:itemId", updateItem);

//Delete
router.delete("/:itemId", deleteItem);

//Like
router.put("/:itemId/likes", likeItem); // new route for liking an item

//unlike

router.delete("/:itemId/likes", unlikeItem); // new route for unliking an item

module.exports = router;
