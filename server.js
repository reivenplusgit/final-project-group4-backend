const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const morgan = require('morgan');
const accountsRoutes = require("./routes/account.routes");
const subjectRoutes = require("./routes/subject.routes")
const studentRoutes = require("./routes/student.routes");
const teacherRoutes = require("./routes/teacher.routes");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require('./routes/auth.routes');
const gradeRoutes = require("./routes/grade.routes");
const disciplinaryRoutes = require("./routes/disciplinary.routes");
const errorHandler = require("./middleware/errorHandler");
const scheduleRoutes = require("./routes/schedule.routes");
const reportRoutes = require("./routes/reports.routes")
const app = express();

const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173', 'http://[::1]:5173/'];

// Connect DB

// Middlewares

app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) callback(null, true);
  else callback(new Error('Not allowed by CORS'));
} }));


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

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

// Logger (optional)
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: "MIE Student Portal Backend is running!" });
});


app.use('/api/auth', authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/reports", reportRoutes);

// Error handler (always last)
app.use(errorHandler);
