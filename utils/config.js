require("dotenv").config(); // Load environment variables from .env file

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-if-not-set";

console.log("Loaded JWT_SECRET:", JWT_SECRET); // Log the loaded JWT_SECRET
console.log("All Environment Variables:", process.env);

module.exports = {
  JWT_SECRET,
};
