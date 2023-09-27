const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

// Importing Error Classes
const BadRequestError = require("../errors/BadRequestError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

const createUser = async (req, res, next) => {
  try {
    const { name, avatar, email, password } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError("Name, email, and password are required.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const newUser = new User({ name, avatar, email, password });
    const savedUser = await newUser.save();

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(201).send({ user: userResponse, token });
  } catch (err) {
    return next(err);
  }
};

const signinUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new UnauthorizedError("Email and password are required");
    }

    const existingUser = await User.findOne({ email }).select("+password");

    if (
      !existingUser ||
      !(await bcrypt.compare(password, existingUser.password))
    ) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign({ _id: existingUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.send({ token, message: "Signed in successfully" });
  } catch (err) {
    return next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "avatar"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      throw new BadRequestError("Invalid updates");
    }

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createUser,
  signinUser,
  getCurrentUser,
  updateCurrentUser,
};
