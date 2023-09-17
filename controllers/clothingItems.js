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
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      next(new BadRequestError("Invalid item ID."));
      return;
    }

    const item = await ClothingItem.findById(itemId);

    if (!item) {
      next(new NotFoundError("No item found with this ID."));
      return;
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      next(new ForbiddenError("You are not authorized to delete this item"));
      return;
    }

    const deletedItem = await item.remove();

    if (!deletedItem) {
      next(new InternalServerError("Item was not deleted successfully."));
      return;
    }

    res.send({
      message: "Item successfully deleted.",
      itemId,
    });
  } catch (err) {
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
