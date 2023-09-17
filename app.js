require("dotenv").config();
const express = require("express");
const { PORT = 3001 } = process.env;
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error-handler"); // Import the error handler

const app = express();

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Middleware
console.log("Applying CORS middleware...");
app.use(cors());

console.log("Applying JSON middleware...");
app.use(express.json());

// Database
console.log("Connecting to database...");
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => console.log("Connected to DB"))
  .catch((e) => console.log("DB error", e));

// Routes
console.log("Applying routes...");
app.use(routes);

// Centralized Error Handling Middleware
// This should come after all routes
console.log("Applying error-handling middleware...");
app.use(errorHandler);

// Server
app.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
  console.log("Server setup complete");
});

module.exports = app;
