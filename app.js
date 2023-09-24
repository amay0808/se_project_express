require("dotenv").config();
const express = require("express");
const { PORT = 3001 } = process.env;
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error-handler");
const { errors } = require("celebrate");
const { requestLogger } = require("./middlewares/logger"); // Only import requestLogger
const winston = require("winston");
const expressWinston = require("express-winston");

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

// Enable request logger right before the routes
app.use(requestLogger);

// Crash Test Route
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

// Routes
console.log("Applying routes...");
app.use(routes);

// Enable the error logger right after the routes
// Use expressWinston.errorLogger directly here
app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.File({ filename: "error.log" })],
    format: winston.format.json(),
  }),
);

// Celebrate Error Handling Middleware
console.log("Applying Celebrate error-handling middleware...");
app.use(errors());

// Centralized Error Handling Middleware
console.log("Applying custom error-handling middleware...");
app.use(errorHandler);

// Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`App listening at ${PORT}`);
  console.log("Server setup complete");
});

module.exports = app;
