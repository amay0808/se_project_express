const router = require("express").Router();

const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem, // newly imported function
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

module.exports = router;
