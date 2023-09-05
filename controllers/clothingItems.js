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
  console.log("Fetching all items...");

  return ClothingItem.find({})
    .then((items) => {
      console.log("Query to database completed."); // Log when query is done
      console.log("Total number of items found:", items.length); // Log the number of items found

      if (items && items.length > 0) {
        console.log("Sending items to client."); // Log that you're sending items
        return res.send(items);
      } else {
        console.log("No items found, sending 404."); // Log when no items are found
        return res.status(NOT_FOUND).send({ message: "No items found." });
      }
    })
    .catch((e) => {
      console.error("Error fetching items:", e); // Log the actual error
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error from getItems" });
    });
};

const getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await ClothingItem.findById(itemId).populate("owner", "name");
    console.log("Populated Item:", item);
    if (!item) {
      return res.status(NOT_FOUND).send({ message: "Item not found" });
    }

    return res.status(200).send(item);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error occurred", error });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log("Deleting item with ID:", itemId); // Log the itemId you are trying to delete

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.log("Invalid item ID format.");
      return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
    }

    const item = await ClothingItem.findById(itemId);

    if (!item) {
      console.log("No item found with this ID.");
      return res
        .status(NOT_FOUND)
        .send({ message: "No item found with this ID." });
    }

    if (item.owner && req.user && req.user._id) {
      console.log(
        `Item owner: ${item.owner.toString()}, Request user ID: ${req.user._id.toString()}`,
      );

      if (item.owner.toString() !== req.user._id.toString()) {
        console.log("Unauthorized deletion attempt.");
        return res
          .status(FORBIDDEN)
          .send({ message: "You are not authorized to delete this item" });
      }
    } else {
      console.log("Either item.owner or req.user._id is undefined");
      console.log(
        "Item owner:",
        item ? item.owner : "Item or item owner is undefined",
      );
      console.log("Request user:", req.user);
      console.log(
        "Request user ID:",
        req.user ? req.user._id : "User ID is undefined",
      );
      return res
        .status(FORBIDDEN)
        .send({ message: "You are not authorized to delete this item" });
    }

    const deletedItem = await item.remove();

    if (!deletedItem) {
      console.log("Item was not deleted successfully.");
      throw new Error("Item was not deleted successfully.");
    }

    console.log("Item successfully deleted, ID:", itemId);
    return res.send({
      message: "Item successfully deleted.",
      itemId,
    });
  } catch (err) {
    console.log("Error from deleteItem:", err);
    return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
  getItemById,
};
