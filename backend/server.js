
// Import core packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
require("dotenv").config();

//Import routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const schedulerRoutes = require("./routes/schedulerRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());           // Read JSON body
app.use(cookieParser());           // Read cookies
app.use(express.urlencoded({ extended: true })); // Read URL-encoded body
app.use(cors()); // for secure connection

//routes
app.use("/auth", authRoutes);
app.use("/patient", patientRoutes);
app.use("/scheduler", schedulerRoutes);
app.use("/doctor", doctorRoutes);
app.use("/receptionist", receptionistRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(5000, (req, res) => {
    
  console.log("Server started on port 5000");
}); 

app.use(cors({
  origin: "http://localhost:3000", // React frontend
                // Allow cookies
}));

