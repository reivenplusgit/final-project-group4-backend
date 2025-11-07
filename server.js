const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const subjectRoutes = require("./routes/subject.routes")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mie-portal")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware for logging in console
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "MIE Student Portal Backend is running!" });
});

app.use("/api/subjects", subjectRoutes)
