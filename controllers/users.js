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
  console.log("Name:", name); // Log the Name received in the request body
  console.log("Avatar:", avatar); // Log the Avatar received in the request body
  console.log("Email:", email); // Log the Email received in the request body
  console.log("Password:", password); // Log the Password received in the request body

  if (!name || !email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Name, email, and password are required." });
  }

  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("User with given email already exists");
    console.log("JWT_SECRET:", JWT_SECRET); // Added log statement
    console.log("existingUser:", existingUser); // Added log statement
    return res.status(CONFLICT).send({ message: "Email already in use" });
  }

  try {
    const newUser = new User({
      name,
      avatar,
      email,
      password: password,
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
    console.log("Token:", token); // Added log statement

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
  console.log("signinUser called with request body:", req.body); // Log incoming request body
  const { email, password } = req.body;
  console.log("Email:", email); // Log the Email received in the request body
  console.log("Password:", password);
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
    console.log("Generated Token:", token);
    return res.send({ token, message: "Signed in successfully" });
  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(INTERNAL_SERVER_ERROR).send({
      message: "Unexpected error during user sign in",
    });
  }
};

const getCurrentUser = async (req, res) => {
  console.log("Getting current user");
  try {
    console.log("getCurrentUser: user id from request:", req.user._id); // Log user id from request
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("getCurrentUser: User not found for id:", req.user._id); // Log if user not found
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    console.log("getCurrentUser: Sending user response for id:", req.user._id); // Log before sending user response
    return res.send(user);
  } catch (err) {
    console.log(
      "getCurrentUser: Error occurred for id:",
      req.user._id,
      "Error:",
      err,
    ); // Log errors if any
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
