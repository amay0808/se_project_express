require("dotenv").config(); // Load environment variables from .env file

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-if-not-set";

module.exports = {
  JWT_SECRET,
};
