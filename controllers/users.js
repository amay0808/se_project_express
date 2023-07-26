const User = require("../models/user");

// Function to handle GET /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) =>
      res
        .status(500)
        .send({ message: "Error occurred while fetching users", error: err }),
    );
};

// Function to handle GET /users/:userId
const getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => res.send(user))
    .catch((err) =>
      res
        .status(500)
        .send({ message: "Error occurred while fetching user", error: err }),
    );
};

// Function to handle POST /users
const createUser = (req, res) => {
  const { name, avatar } = req.body;

  if (!name || !avatar) {
    return res
      .status(400)
      .send({ message: "Missing name or avatar in request body" });
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
