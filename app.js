require("dotenv").config();
const express = require("express");
const { PORT = 3001 } = process.env;
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => console.log("connected to db"))
  .catch((e) => console.log("DB error", e));

// Routes
app.use(routes);

// Server
app.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
  console.log("This is working");
});

module.exports = app;
