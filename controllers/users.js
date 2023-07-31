const mongoose = require("mongoose");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  CREATED,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() =>
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred while fetching users" }),
    );
};

const getUser = (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(BAD_REQUEST).json({ message: "Invalid User ID" });
  }

  User.findById(userId)
    .then((userResult) => {
      if (!userResult) {
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }
      return res.json(userResult);
    })
    .catch(() =>
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred while fetching user" }),
    );
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  const user = new User({ name, avatar });

  user
    .save()
    .then((userResult) => res.status(CREATED).json(userResult))
    .catch((err) => {
      // console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: "Error in user data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred while creating user" });
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
};
