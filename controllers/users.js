const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  CREATED,
  UNAUTHORIZED,
  CONFLICT,
} = require("../utils/errors");

const createUser = async (req, res) => {
  console.log("createUser function called with request body:", req.body);

  const { name, avatar, email, password } = req.body;

  if (!name || name.length < 2 || name.length > 30) {
    console.log("Failed at name validation");
    return res.status(BAD_REQUEST).send({ message: "Invalid name length" });
  }

  if (!email || !validator.isEmail(email)) {
    console.log("Failed at email validation");
    return res.status(BAD_REQUEST).send({ message: "Invalid email format" });
  }

  if (avatar && !validator.isURL(avatar)) {
    console.log("Failed at avatar URL validation");
    return res.status(BAD_REQUEST).send({ message: "Invalid avatar URL" });
  }

  try {
    const newUser = new User({
      name,
      avatar,
      email,
      password,
    });

    console.log("Attempting to save user to database...");
    const savedUser = await newUser.save();
    console.log("User saved successfully, removing password from response...");
    savedUser.password = undefined;

    return res.status(CREATED).send(savedUser);
  } catch (err) {
    console.error("Error occurred during user creation:", err);

    if (err.code === 11000) {
      console.log(
        "Detected duplicate key error (code 11000). Sending conflict response.",
      );
      return res.status(CONFLICT).send({ message: "Email already in use" });
    }

    if (err.name === "ValidationError") {
      console.log(
        "Validation error during user creation. Sending bad request response.",
      );
      return res.status(BAD_REQUEST).send({ message: "Error in user data" });
    }

    console.log(
      "Unexpected error during user creation. Sending internal server error response.",
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      message: "Unexpected error during user creation",
    });
  }
};

const signinUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(UNAUTHORIZED)
      .send({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return res
        .status(UNAUTHORIZED)
        .send({ message: "Invalid email or password" });
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

    return res.send({ token, message: "Signed in successfully" });
  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(INTERNAL_SERVER_ERROR).send({
      message: "Unexpected error during user sign in",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    return res.send(user);
  } catch (err) {
    console.error(err);
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while fetching current user" });
  }
};

const updateCurrentUser = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "avatar"];

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

    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    // Avatar URL validation
    if (user.avatar && !validator.isURL(user.avatar)) {
      return res.status(BAD_REQUEST).send({ message: "Invalid avatar URL" });
    }

    await user.save({ validateBeforeSave: true });
    return res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: "Error in user data" });
    }
    console.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send({
      message: "Unexpected error during current user update",
    });
  }
};

module.exports = {
  createUser,
  signinUser,
  getCurrentUser,
  updateCurrentUser,
};
