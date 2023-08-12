const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },

  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        console.log(`URL: ${v}, isValid: ${validator.isURL(v)}`);
        return validator.isURL(v);
      },
      message: "Avatar link is not valid",
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Email is not valid",
    },
  },

  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.pre("save", async function hashPassword(next) {
  if (this.isModified("password")) {
    console.log("Hashing password for user:", this.email);
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
