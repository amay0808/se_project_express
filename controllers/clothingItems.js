const ClothingItem = require("../models/clothingItem");
const mongoose = require("mongoose");
const validator = require("validator");

const createItem = (req, res) => {
  console.log("createItem called");
  const { name, weather, imageUrl } = req.body;

  if (!name || name.length < 2 || name.length > 30) {
    res
      .status(400)
      .send({ message: "Name must be between 2 and 30 characters long." });
    return;
  }

  if (!weather) {
    res.status(400).send({ message: "Weather field is required." });
    return;
  }

  if (!validator.isURL(imageUrl)) {
    res.status(400).send({ message: "Invalid URL for imageUrl." });
    return;
  }

  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner, likes: [] })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((e) => {
      res.status(500).send({ message: "Error from createItem ", e });
    });
};

const likeItem = (req, res) => {
  console.log("likeItem called");
  const { itemId } = req.params;
  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).send({ message: "Invalid ID format." });
  }

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).send({ message: "Item not found." });
      }
      res.send({
        message: `Item with id ${itemId} liked successfully`,
        data: updatedItem,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ message: "An error occurred while trying to like the item" });
    });
};

const unlikeItem = (req, res) => {
  console.log("unlikeItem called");
  const { itemId } = req.params;
  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).send({ message: "Invalid ID format." });
  }

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).send({ message: "Item not found." });
      }
      res.send({
        message: `Item with id ${itemId} unliked successfully`,
        data: updatedItem,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ message: "An error occurred while trying to unlike the item" });
    });
};

const getItems = (req, res) => {
  console.log("getItems called");
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((e) => {
      res.status(500).send({ message: "Error from getItems failed", e });
    });
};

const updateItem = (req, res) => {
  console.log("updateItem called");
  const { itemId } = req.params;
  const { imageUrl } = req.body;
  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } }, { new: true })
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((e) => {
      res.status(500).send({ message: "Error from updateItem failed", e });
    });
};

const deleteItem = (req, res) => {
  console.log("deleteItem called");
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).send({ message: "Invalid ID format." });
  }

  ClothingItem.findByIdAndDelete(itemId)
    .then((item) => {
      if (!item) {
        return res.status(404).send({ message: "No item found with this ID." });
      }
      res
        .status(200)
        .send({ message: "Item successfully deleted.", data: item });
    })
    .catch((e) => {
      res.status(500).send({ message: "Error from deleteItem failed", e });
    });
};

module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem,
  unlikeItem, // newly added function
};
