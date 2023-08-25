const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
  console.log("Reached register endpoint");
  const { name, avatar, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Name, email, and password are required." });
  }

  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("User with given email already exists");
    return res.status(CONFLICT).send({ message: "Email already in use" });
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

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    // Generate JWT token
    const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send back user data and token
    return res.status(CREATED).send({ user: userResponse, token });
  } catch (err) {
    console.error("Error occurred during user creation:", err);

    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: err.message });
    }

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
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }

    return res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: err.message });
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
