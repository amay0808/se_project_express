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

  if (!name) {
    return res.status(400).send({ message: "Name field is required" });
  }

  if (!avatar) {
    return res.status(400).send({ message: "Avatar field is required" });
  }

  try {
    new URL(avatar);
  } catch (_) {
    return res.status(400).send({ message: "Avatar must be a valid URL" });
  }

  if (name.length < 2 || name.length > 30) {
    return res
      .status(400)
      .send({ message: "Name must be between 2 and 30 characters" });
  }

  User.create({ name, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) =>
      res
        .status(500)
        .send({ message: "Error occurred while creating user", error: err }),
    );
};

module.exports = {
  getUsers,
  getUser,
  createUser,
};
