const mongoose = require("mongoose");
const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error occurred while fetching users" });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid User ID" });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      res.send(user);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error occurred while fetching user" });
    });
};
const createUser = (req, res) => {
  const { name, avatar } = req.body;

  let url;
  try {
    url = new URL(avatar);
  } catch (_) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Avatar must be a valid URL" });
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Avatar must be a valid URL" });
  }

  if (name.length < 2 || name.length > 30) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Name must be between 2 and 30 characters" });
  }

  const user = new User({ name, avatar });

  user
    .save()
    .then((user) => res.status(CREATED).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        res.status(BAD_REQUEST).send({ message: "Error in user data" });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "Error occurred while creating user" });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
};
