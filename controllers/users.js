const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = require("../models/user");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  CREATED,
  UNAUTHORIZED,
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    console.error(err);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while fetching users" });
  }
};

// Get specific user by ID
const getUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid User ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    console.error(err);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while fetching user" });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { name, avatar, email, password } = req.body;

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid email format" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      avatar,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(CREATED).send(savedUser);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(BAD_REQUEST).send({ message: "Email already in use" });
    }
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: "Error in user data" });
    }
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while creating user" });
  }
};

const signinUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isValidPassword) {
      return res
        .status(UNAUTHORIZED)
        .send({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ _id: existingUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.send({ token, message: "Signed in successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while signing in" });
  }
};

// Update user details
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, avatar, email } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.send(updatedUser);
  } catch (err) {
    console.error(err);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while updating user" });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    console.error(err);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while fetching current user" });
  }
};
const updateCurrentUser = async (req, res) => {
  const updates = Object.keys(req.body); // get the keys of the fields to be updated
  const allowedUpdates = ["name", "avatar", "email", "password"]; // define allowed fields
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(BAD_REQUEST).send({ message: "Invalid updates" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }

    updates.forEach((update) => (user[update] = req.body[update]));

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    await user.save({ validateBeforeSave: true }); // enable validators

    res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: "Error in user data" });
    }
    console.error(err);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while updating current user" });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  signinUser,
  updateUser,
  getCurrentUser,
  updateCurrentUser,
};
