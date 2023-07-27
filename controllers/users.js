const mongoose = require("mongoose");
const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) =>
      res
        .status(500)
        .send({ message: "Error occurred while fetching users", error: err }),
    );
};

const getUser = (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: "Invalid User ID" });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send(user);
    })
    .catch((err) =>
      res
        .status(500)
        .send({ message: "Error occurred while fetching user", error: err }),
    );
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  // Check if the name field is not provided
  if (!name) {
    return res.status(400).send({ message: "Name field is required" });
  }

  // Check if the avatar field is not provided
  if (!avatar) {
    return res.status(400).send({ message: "Avatar field is required" });
  }

  // Check if avatar is a valid URL
  let url;

  try {
    url = new URL(avatar);
  } catch (_) {
    return res.status(400).send({ message: "Avatar must be a valid URL" });
  }

  // Additional check for the validity of the URL
  if (!["http:", "https:"].includes(url.protocol)) {
    return res.status(400).send({ message: "Avatar must be a valid URL" });
  }

  // Check if the name field is less than 2 characters or greater than 30 characters
  if (name.length < 2 || name.length > 30) {
    return res
      .status(400)
      .send({ message: "Name must be between 2 and 30 characters" });
  }

  const user = new User({ name, avatar });

  user
    .save()
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: err.message, error: err });
      } else {
        res
          .status(500)
          .send({ message: "Error occurred while creating user", error: err });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
};
