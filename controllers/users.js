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
} = require("../utils/errors");

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
    return res.send(user);
  } catch (err) {
    console.error(err);
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "Error occurred while fetching user" });
  }
}; // Create a new user
const createUser = async (req, res) => {
  const { name, avatar, email, password } = req.body;

  // Name validation
  if (name && (name.length < 2 || name.length > 30)) {
    return res.status(BAD_REQUEST).send({
      message: "Name must be between 2 and 30 characters",
    });
  }

  if (!email) {
    return res.status(BAD_REQUEST).send({ message: "Email is required" });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid email format" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email }).select("+password");
    if (existingUser) {
      return res.status(409).send({ message: "Email already in use" });
    }

    const newUser = new User({
      name,
      avatar,
      email,
      password, // Directly use the password from req.body
    });

    const savedUser = await newUser.save();
    savedUser.password = undefined;

    return res.status(CREATED).send(savedUser);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).send({ message: "Email already in use" });
    }
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: "Error in user data" });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({
      message: "Unexpected error during user creation",
    });
  }
};

const signinUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Attempting to sign in user with email:", email);

  if (!email) {
    console.log("Email not provided.");
    return res.status(UNAUTHORIZED).send({ message: "Email is required" });
  }
  if (!password) {
    console.log("Password not provided.");
    return res.status(UNAUTHORIZED).send({ message: "Password is required" });
  }

  try {
    const existingUser = await User.findOne({ email }).select("+password");
    console.log("User retrieved from the database:", existingUser);

    if (!existingUser) {
      console.log("No user found with email:", email);
      return res.status(401).send({ message: "Email not found" });
    }

    if (!existingUser.password) {
      console.log("Password is missing in the database for email:", email);
      return res
        .status(401)
        .send({ message: "Password is missing in the database" });
    }
    console.log("Input password:", password);
    console.log("Stored hashed password:", existingUser.password);

    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );
    console.log("Is password valid?", isValidPassword);

    if (!isValidPassword) {
      console.log("Invalid password for email:", email);
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
    return res.send(updatedUser);
  } catch (err) {
    console.error(err);
    return res
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
  const allowedUpdates = ["name", "avatar", "email", "password"];
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

    // Name validation
    if (user.name && (user.name.length < 2 || user.name.length > 30)) {
      return res.status(BAD_REQUEST).send({
        message: "Name must be between 2 and 30 characters",
      });
    }

    // Avatar URL validation
    if (user.avatar && !validator.isURL(user.avatar)) {
      return res.status(BAD_REQUEST).send({
        message: "Invalid avatar URL",
      });
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
  getUsers,
  getUser,
  createUser,
  signinUser,
  updateUser,
  getCurrentUser,
  updateCurrentUser,
};
