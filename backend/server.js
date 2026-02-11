
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
const User = require("./models/user");
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

app.get("/", async (req, res) => {
  res.send("Welcome to Clinic Management System API");
  // try {
  //   let messages = [];

  //   // ===== DOCTOR =====
  //   const existingDoctor = await User.findOne({
  //     role: "doctor",
  //     username: "doctor1"
  //   });

  //   if (!existingDoctor) {
  //     const doctor = new User({
  //       role: "doctor",
  //       authProvider: "local",
  //       name: "Dr. Sai",
  //       username: "doctor1",
  //       password: "sai123"
  //     });

  //     await doctor.save();
  //     messages.push("Doctor created");
  //   } else {
  //     messages.push("Doctor already exists");
  //   }

  //   // ===== RECEPTIONIST =====
  //   const existingReceptionist = await User.findOne({
  //     role: "receptionist",
  //     username: "recep1"
  //   });

  //   if (!existingReceptionist) {
  //     const receptionist = new User({
  //       role: "receptionist",
  //       authProvider: "local",
  //       name: "Receptionist User",
  //       username: "recep1",
  //       password: "sai123"
  //     });

  //     await receptionist.save();
  //     messages.push("Receptionist created");
  //   } else {
  //     messages.push("Receptionist already exists");
  //   }

  //   // ===== SCHEDULER =====
  //   const existingScheduler = await User.findOne({
  //     role: "scheduler",
  //     username: "scheduler1"
  //   });

  //   if (!existingScheduler) {
  //     const scheduler = new User({
  //       role: "scheduler",
  //       authProvider: "local",
  //       name: "Scheduler User",
  //       username: "scheduler1",
  //       password: "sai123"
  //     });

  //     await scheduler.save();
  //     messages.push("Scheduler created");
  //   } else {
  //     messages.push("Scheduler already exists");
  //   }

  //   res.send({
  //     message: "Initialization Complete",
  //     details: messages
  //   });

  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Error initializing users");
  // }
});




app.listen(5000, async () => {
  console.log("Server started on port 5000");

  try {
    let messages = [];

    // ===== DOCTOR =====
    const existingDoctor = await User.findOne({
      role: "doctor",
      username: "doctor1"
    });

    if (!existingDoctor) {
      //const hashedPassword = await bcrypt.hash("sai123", 10);

      const doctor = new User({
        role: "doctor",
        authProvider: "local",
        name: "Dr. Sai",
        username: "doctor1",
        password: "sai123"
      });

      await doctor.save();
      messages.push("Doctor created");
    } else {
      messages.push("Doctor already exists");
    }

    // ===== RECEPTIONIST =====
    const existingReceptionist = await User.findOne({
      role: "receptionist",
      username: "recep1"
    });

    if (!existingReceptionist) {
      //const hashedPassword = await bcrypt.hash("sai123", 10);

      const receptionist = new User({
        role: "receptionist",
        authProvider: "local",
        name: "Receptionist User",
        username: "recep1",
        password: sai123
      });

      await receptionist.save();
      messages.push("Receptionist created");
    } else {
      messages.push("Receptionist already exists");
    }

    // ===== SCHEDULER =====
    const existingScheduler = await User.findOne({
      role: "scheduler",
      username: "scheduler1"
    });

    if (!existingScheduler) {
      //const hashedPassword = await bcrypt.hash("sai123", 10);

      const scheduler = new User({
        role: "scheduler",
        authProvider: "local",
        name: "Scheduler User",
        username: "scheduler1",
        password: sai123
      });

      await scheduler.save();
      messages.push("Scheduler created");
    } else {
      messages.push("Scheduler already exists");
    }

    console.log("Initialization Complete:", messages);

  } catch (error) {
    console.error("Initialization Error:", error);
  }
});


app.use(cors({
  origin: "http://localhost:3000", // React frontend
                // Allow cookies
}));

