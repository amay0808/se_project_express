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
        const isValid = validator.isURL(v) || v.startsWith("/images/");
        console.log(`URL: ${v}, isValid: ${isValid}`);
        return isValid;
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
  // Debug logs
  console.log("Entered pre-save middleware");
  console.log("Is password modified?", this.isModified("password"));

  if (this.isModified("password")) {
    console.log("Hashing password for user:", this.email);

    // Store original password for debugging
    const originalPassword = this.password;

    this.password = await bcrypt.hash(this.password, 12);

    // Debug log to compare original and hashed password
    console.log(
      `Original password: ${originalPassword}, Hashed: ${this.password}`,
    );
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
