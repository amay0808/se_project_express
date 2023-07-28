const ClothingItem = require("../models/clothingItem");
const mongoose = require("mongoose");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const createItem = (req, res) => {
  console.log("createItem called");
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner, likes: [] })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(BAD_REQUEST).send({
          message: "Validation Error: Invalid Data.",
          error: err.errors,
        });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "Error from createItem ", error: err });
      }
    });
};

const likeItem = (req, res) => {
  console.log("likeItem called");
  const { itemId } = req.params;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid ID format." });
  }

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: _id } },
    { new: true },
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      res.send({
        message: `Item with id ${itemId} liked successfully`,
        data: updatedItem,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while trying to like the item" });
    });
};

const unlikeItem = (req, res) => {
  console.log("unlikeItem called");
  const { itemId } = req.params;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid ID format." });
  }

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: _id } },
    { new: true },
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      res.send({
        message: `Item with id ${itemId} unliked successfully`,
        data: updatedItem,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while trying to unlike the item" });
    });
};

const getItems = (req, res) => {
  console.log("getItems called");
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((e) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from getItems failed", e });
    });
};

const deleteItem = (req, res) => {
  console.log("deleteItem called");
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid ID format." });
  }

  ClothingItem.findByIdAndDelete(itemId)
    .then((item) => {
      if (!item) {
        return res
          .status(NOT_FOUND)
          .send({ message: "No item found with this ID." });
      }
      res.send({ message: "Item successfully deleted.", data: item });
    })
    .catch((e) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from deleteItem failed", e });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
};
