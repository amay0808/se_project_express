const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");

const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  ForbiddenError,
} = require("../errors/custom-errors"); // Import custom error constructors

// CREATE ITEM
const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner, likes: [] })
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError("Validation Error: Invalid Data."));
      } else {
        next(new InternalServerError("Error from createItem"));
      }
    });
};

// LIKE ITEM
const likeItem = (req, res, next) => {
  const { itemId } = req.params;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    next(new BadRequestError("Invalid ID format."));
    return;
  }

  ClothingItem.findByIdAndUpdate(
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
        : next(new NotFoundError("Item not found.")),
    )
    .catch((err) => {
      next(
        new InternalServerError(
          "An error occurred while trying to like the item",
        ),
      );
    });
};

// UNLIKE ITEM
const unlikeItem = (req, res, next) => {
  const { itemId } = req.params;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    next(new BadRequestError("Invalid ID format."));
    return;
  }

  ClothingItem.findByIdAndUpdate(
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
        : next(new NotFoundError("Item not found.")),
    )
    .catch((err) => {
      next(
        new InternalServerError(
          "An error occurred while trying to unlike the item",
        ),
      );
    });
};

// GET ITEMS
const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => {
      if (items && items.length > 0) {
        res.send(items);
      } else {
        next(new NotFoundError("No items found."));
      }
    })
    .catch((e) => {
      next(new InternalServerError("Error from getItems"));
    });
};

// GET ITEM BY ID
const getItemById = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const item = await ClothingItem.findById(itemId).populate("owner", "name");

    if (!item) {
      next(new NotFoundError("Item not found"));
    } else {
      res.status(200).send(item);
    }
  } catch (error) {
    next(new InternalServerError("An error occurred"));
  }
};

// DELETE ITEM
const deleteItem = async (req, res, next) => {
  try {
    console.log("Delete Item Function Called"); // Log when the function is called

    const { itemId } = req.params;
    console.log("Item ID to be deleted:", itemId); // Log the item ID to be deleted

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.log("Invalid item ID"); // Log if item ID is invalid
      next(new BadRequestError("Invalid item ID."));
      return;
    }

    const item = await ClothingItem.findById(itemId);
    console.log("Found Item:", item); // Log the found item

    if (!item) {
      console.log("Item not found"); // Log if item is not found
      next(new NotFoundError("No item found with this ID."));
      return;
    }

    console.log("Item Owner:", item.owner.toString()); // Log the owner of the item
    console.log("Request User ID:", req.user.id.toString()); // Log the user ID from the request

    if (item.owner.toString() !== req.user._id.toString()) {
      console.log("Unauthorized to delete item"); // Log if user is not authorized to delete the item
      next(new ForbiddenError("You are not authorized to delete this item"));
      return;
    }

    const deletedItem = await item.remove();
    console.log("Deleted Item:", deletedItem); // Log the deleted item

    if (!deletedItem) {
      console.log("Item not deleted successfully"); // Log if item is not deleted successfully
      next(new InternalServerError("Item was not deleted successfully."));
      return;
    }

    res.send({
      message: "Item successfully deleted.",
      itemId,
    });
  } catch (err) {
    console.log("Error Occurred:", err.message); // Log any error that occurs
    next(new InternalServerError(err.message));
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
