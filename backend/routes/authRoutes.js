const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");



router.get("/register", (req, res) => {
  res.send("User registration page");
});


router.get("/patient/auth", (req, res) => {
  res.send("Patient signup authorization page");
});

// PATIENT CREATE PAGE
router.get("/patient/create", (req, res) => {
  res.send("Patient signin authorization page");
});

// PATIENT CREATE
router.post("/patient/create", async (req, res) => {
  try {
    const { name, dob, gender, email, password, mobile } = req.body;

    const existingPatient = await User.findOne({ email });

    if (existingPatient) {
      return res.json({
        success: false,
        message: "Patient already registered. Please sign in."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new User({
      role: "patient",
      authProvider: "local",
      name,
      dob,
      gender,
      email,
      password: hashedPassword,
      mobile: mobile
    });

    await newPatient.save();

    // 🔑 JWT with email instead of id
    const token = jwt.sign(
      {
        email: newPatient.email,
        role: newPatient.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
  });
    res.json({
      success: true,
      message: "Patient registered successfully",
      token,
      user: {
        name: newPatient.name,
        email: newPatient.email,
        dob: newPatient.dob,
        gender: newPatient.gender,
        mobile: newPatient.mobile,
        role: newPatient.role
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error in patient signup"
    });
  }
});

// PATIENT SIGN-IN
router.post("/patient/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find patient
    const patient = await User.findOne({
      email,
      role: "patient"
    });

    if (!patient) {
      return res.json({
        success: false,
        message: "Patient not registered. Please create account."
      });
    }

    // 2. Compare password (bcrypt)
    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3. Generate JWT (EMAIL inside token)
    const token = jwt.sign(
      {
        email: patient.email,
        role: patient.role
      },
      process.env.JWT_SECRET
      // ❌ NO expiresIn → cookie controls session
    );

    // 🍪 4. STORE TOKEN IN COOKIE (SESSION COOKIE)
    res.cookie("token", token, {
      httpOnly: true,   // JS cannot access
      secure: false,    // true in production (HTTPS)
      sameSite: "lax"
    });

    // 5. Send response (NO TOKEN IN JSON)
    res.json({
      success: true,
      message: "Login successfully",
      token,
      user: {
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        mobile: patient.mobile,
       
        role: patient.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});


// PATIENT LOGOUT(optinal)
router.post("/patient/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});


// CREATE DOCTOR MANUALLY (one-time setup)
router.get("/doctor/create", async (req, res) => {
  try {
    // Check if doctor already exists
    const existingDoctor = await User.findOne({
      role: "doctor",
      username: "doctor1"
    });

    if (existingDoctor) {
      return res.send("Doctor already exists");
    }

    // Create doctor
    const doctor = new User({
      role: "doctor",
      authProvider: "local",
      name: "Dr. Sai",
      username: "doctor1",
      password: "sai123"
    });

    await doctor.save();

    res.send("Doctor created successfully");

  } catch (error) {
    res.send("Error creating doctor");
  }
});

router.post("/doctor/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const doctor = await User.findOne({
      role: "doctor",
      username
    });

    if (!doctor) {
      return res.json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (doctor.password !== password) {
      return res.json({
        success: false,
        message: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      message: "Doctor login successfully",
      user: {
        id: doctor._id,
        name: doctor.name,
        role: doctor.role
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error during doctor login"
    });
  }
});

// receptionist SIGN-IN
router.get("/receptionist/create", async (req, res) => {
  try {
    const existingReceptionist = await User.findOne({
      role: "receptionist",
      username: "recep1"
    });

    if (existingReceptionist) {
      return res.send("Receptionist already exists");
    }

    const receptionist = new User({
      role: "receptionist",
      authProvider: "local",
      name: "Receptionist User",
      username: "recep1",
      password: "sai123"
    });

    await receptionist.save();

    res.send("Receptionist created successfully");

  } catch (error) {
    res.send("Error creating receptionist");
  }
});

// scheduler SIGN-IN
router.get("/scheduler/create", async (req, res) => {
  try {
    const existingScheduler = await User.findOne({
      role: "scheduler",
      username: "scheduler1"
    });

    if (existingScheduler) {
      return res.send("Scheduler already exists");
    }

    const scheduler = new User({
      role: "scheduler",
      authProvider: "local",
      name: "Scheduler User",
      username: "scheduler1",
      password: "sai123"
    });

    await scheduler.save();

    res.send("Scheduler created successfully");

  } catch (error) {
    res.send("Error creating scheduler");
  }
});

// COMMON STAFF SIGN-IN (Doctor, Receptionist, Scheduler)
const jwt = require("jsonwebtoken");

// COMMON STAFF SIGN-IN (Doctor, Receptionist, Scheduler)
router.post("/staff/login", async (req, res) => {
  try {
    const { role, username, password } = req.body;

    // 1. Validate role
    if (!["doctor", "receptionist", "scheduler"].includes(role)) {
      return res.json({
        success: false,
        message: "Invalid role"
      });
    }

    // 2. Find staff user
    const user = await User.findOne({
      role,
      username
    });

    if (!user) {
      return res.json({
        success: false,
        message: `${role} not found`
      });
    }

    // 3. Check password
    // (plain text is okay here since only one staff per role)
    if (user.password !== password) {
      return res.json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // 4. Generate JWT (store role + username)
    const token = jwt.sign(
      {
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET
      // ❌ no expiresIn → session cookie
    );

    // 5. 🍪 Store token in HTTP-only cookie
    // res.cookie("token", token, {
     // httpOnly: true,
    //  secure: false,   // true in production (HTTPS)
    //  sameSite: "lax"
      // ❌ no maxAge → stays until logout
   // });

    // 6. Send response (token in body)
    res.json({
      success: true,
      token,
      message: "Login successfully",
      user: {
        name: user.name,
        role: user.role,
        username: user.username
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error during staff login"
    });
  }
});


// STAFF LOGOUT
router.post("/staff/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Staff logged out successfully"
  });
});


module.exports = router;
