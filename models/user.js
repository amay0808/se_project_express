const mongoose = require("mongoose");
const validator = require("validator");

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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
