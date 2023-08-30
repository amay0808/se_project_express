const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
} = require("../utils/errors");

const createItem = (req, res) => {
  console.log("Creating an item with data:", req.body);

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner, likes: [] })
    .then((item) => {
      // console.log(item);
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
  // console.log("likeItem called");

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
      // console.log(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while trying to like the item" });
    });
};

const unlikeItem = (req, res) => {
  // console.log("unlikeItem called");

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
      // console.log(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while trying to unlike the item" });
    });
};

const getItems = (req, res) => {
  console.log("Fetching all items");

  return ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((e) => {
      // console.log(e);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from getItems" });
    });
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // console.log("deleteItem called with itemId:", itemId);

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
    }

    const item = await ClothingItem.findById(itemId);

    if (!item) {
      return res
        .status(NOT_FOUND)
        .send({ message: "No item found with this ID." });
    }

    // console.log("Item owner:", item.owner.toString());
    // console.log("Request user ID:", req.user._id.toString());

    if (item.owner.toString() !== req.user._id.toString()) {
      // console.log("Unauthorized deletion attempt.");
      return res
        .status(FORBIDDEN)
        .send({ message: "You are not authorized to delete this item" });
    }

    const deletedItem = await item.remove();

    if (!deletedItem) {
      throw new Error("Item was not deleted successfully.");
    }

    return res.send({
      message: "Item successfully deleted.",
      itemId,
    });
  } catch (err) {
    // console.log("Error from deleteItem:", err);
    return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
};
