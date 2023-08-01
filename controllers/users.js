const mongoose = require("mongoose");

const User = require("../models/user");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  CREATED,
} = require("../utils/errors");

const getUsers = (req, res) =>
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error occurred while fetching users" });
    });

const getUser = (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid User ID" });
  }

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.send(user);
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error occurred while fetching user" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  const newUser = new User({ name, avatar });

  return newUser
    .save()
    .then((savedUser) => res.status(CREATED).send(savedUser))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Error in user data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error occurred while creating user" });
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
};
