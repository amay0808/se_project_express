const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const createItem = (req, res) => {
  console.log("createItem called");

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner, likes: [] })
    .then((item) => {
      console.log(item);
      return res.send({ data: item });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(BAD_REQUEST).send({
          message: "Validation Error: Invalid Data.",
        });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from createItem" });
    });
};

const likeItem = (req, res) => {
  console.log("likeItem called");

  const { itemId } = req.params;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid ID format." });
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: _id } },
    { new: true },
  )
    .then((updatedItem) =>
      updatedItem
        ? res.send({
            message: `Item with id ${itemId} liked successfully`,
            data: updatedItem,
          })
        : res.status(NOT_FOUND).send({ message: "Item not found." }),
    )
    .catch((err) => {
      console.log(err);
      return res
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

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: _id } },
    { new: true },
  )
    .then((updatedItem) =>
      updatedItem
        ? res.send({
            message: `Item with id ${itemId} unliked successfully`,
            data: updatedItem,
          })
        : res.status(NOT_FOUND).send({ message: "Item not found." }),
    )
    .catch((err) => {
      console.log(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while trying to unlike the item" });
    });
};

const getItems = (req, res) => {
  console.log("getItems called");

  return ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((e) => {
      console.log(e);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from getItems" });
    });
};

const deleteItem = (req, res) => {
  console.log("deleteItem called");

  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid ID format." });
  }

  return ClothingItem.findByIdAndDelete(itemId)
    .then((item) =>
      item
        ? res.send({ message: "Item successfully deleted.", data: item })
        : res
            .status(NOT_FOUND)
            .send({ message: "No item found with this ID." }),
    )
    .catch((e) => {
      console.log(e);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from deleteItem" });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
};
