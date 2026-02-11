const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const protect = require("../middleware/authMiddleware");
const Bill = require("../models/Bill");
const Report = require("../models/Report");
const User = require("../models/user");
// GET – Request Appointment Page (authorization entry)
router.get("/request", (req, res) => {
  res.send("Request Appointment Page");
});

// POST – Submit Appointment Request
router.post("/request", protect, async (req, res) => {
  try {
    const { patientName, dob, address, appointmentTime } = req.body;

    // Optional pre-check (fast feedback)
    const slotTaken = await Appointment.findOne({ appointmentTime });
    if (slotTaken) {
      return res.json({
        success: false,
        message: "This time slot is already booked. Please choose another time."
      });
    }

    const appointment = new Appointment({
      patientName,
      dob,
      address,
      appointmentTime,
      patientEmail: req.user.email
    });

    await appointment.save();

    res.json({
    
      success: true,
      message: "Appointment request submitted successfully"
    });

  } catch (error) {
    // 🔴 DB-level duplicate protection
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "This time slot is already booked. Please choose another time."
      });
    }


    res.json({
      success: false,
      message: "Error submitting appointment request"
    });
  }
});


// VIEW APPOINTMENTS (PATIENT ONLY)
router.get("/view-approved", protect, async (req, res) => {
  try {
    //console.log("JWT EMAIL:", req.user.email);

    const patientEmail = req.user.email; // from JWT

    const appointments = await Appointment.find({
      patientEmail,
      status: "Approved" 
    });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching appointments"
    });
  }
});

// Patient - View pending and rejected appointments
router.get("/pending", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientEmail: req.user.email,
      status: { $in: ["Pending", "Rejected"] }
    });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching appointments"
    });
  }
});


// Patient - Active appointments (Reported & Billed)
router.get("/appointments/active", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientEmail: req.user.email,
      status: { $in: ["Reported", "Billed"] }
    });

    // Check bill existence for each appointment
    const result = await Promise.all(
      appointments.map(async (appt) => {
        const bill = await Bill.findOne({ appointmentId: appt._id });

        return {
          ...appt.toObject(),
          billAvailable: !!bill
        };
      })
    );

    res.json({
      success: true,
      appointments: result
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching active appointments"
    });
  }
});


// Patient - Delete appointment from DB
router.delete("/appointment/:appointmentId" , protect,  async (req, res) => {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.json({
          success: false,
          message: "Appointment not found"
        });
      }

      // 🔐 Ensure appointment belongs to patient
      if (appointment.patientEmail !== req.user.email) {
        return res.json({
          success: false,
          message: "Not authorized to delete this appointment"
        });
      }

      // ❌ Do not allow delete if paid
      if (appointment.status === "Paid") {
        return res.json({
          success: false,
          message: "Paid appointments cannot be deleted"
        });
      }

      // ✅ Allowed delete statuses
      const allowedStatuses = ["Pending", "Approved", "Rejected"];

      if (!allowedStatuses.includes(appointment.status)) {
        return res.json({
          success: false,
          message: "Appointment cannot be deleted"
        });
      }

      // 🗑️ HARD DELETE
      await appointment.deleteOne();

      res.json({
        success: true,
        message: "Appointment deleted successfully"
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error deleting appointment"
      });
    }
  }
);

// Patient - View bill
router.get("/bill/:appointmentId", protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const bill = await Bill.findOne({ appointmentId });

    if (!bill) {
      return res.json({
        success: false,
        message: "Bill not found"
      });
    }

    res.json({
      success: true,
      bill
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching bill"
    });
  }
});

// Patient - Pay bill
router.post("/pay-bill", protect, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const bill = await Bill.findOne({ appointmentId });

    if (!bill || bill.billStatus === "Paid") {
      return res.json({
        success: false,
        message: "Bill already paid or not found"
      });
    }

    // 1️⃣ Mark bill as paid
    bill.billStatus = "Paid";
    await bill.save();

    // 2️⃣ Update appointment status
    const appointment = await Appointment.findById(appointmentId);
    appointment.status = "Paid";
    await appointment.save();

    res.json({
      success: true,
      message: "Payment successful"
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Payment failed"
    });
  }
});

// Patient - View report (only after payment)
router.get("/report/:appointmentId", protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // 1️⃣ Check appointment is paid
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment || appointment.status !== "Paid") {
      return res.json({
        success: false,
        message: "Please pay bill to view report"
      });
    }

    // 2️⃣ Fetch report
    const report = await Report.findOne({ appointmentId });

    if (!report) {
      return res.json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching report"
    });
  }
});

// Patient - Appointment history (Paid)
router.get("/history", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientEmail: req.user.email,
      status: "Paid"
    });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching appointment history"
    });
  }
});


// Patient - View profile
router.get("/profile",  protect,  async (req, res) => {
    try {
      const patient = await User.findOne(
        { email: req.user.email, role: "patient" },
        {
          name: 1,
          email: 1,
          phone: 1,
          dob: 1,
          gender: 1,
          createdAt: 1
        }
      );

      if (!patient) {
        return res.json({
          success: false,
          message: "Patient not found"
        });
      }

      res.json({
        success: true,
        patient
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching profile"
      });
    }
  }
);

// Patient - Update profile
router.put("/update-profile",  protect,  async (req, res) => {
    try {
      const {
        name,
        phone,
        dob,
        gender,
        oldPassword,
        newPassword
      } = req.body;

      const patient = await User.findOne({
        email: req.user.email,
        role: "patient"
      });

      if (!patient) {
        return res.json({
          success: false,
          message: "Patient not found"
        });
      }

      // 🔐 CHANGE PASSWORD (only if provided)
      if (oldPassword && newPassword) {
        const isMatch = await bcrypt.compare(
          oldPassword,
          patient.password
        );

        if (!isMatch) {
          return res.json({
            success: false,
            message: "Old password is incorrect"
          });
        }

        const salt = await bcrypt.genSalt(10);
        patient.password = await bcrypt.hash(newPassword, salt);
      }

      // 📝 UPDATE PROFILE FIELDS
      if (name) patient.name = name;
      if (phone) patient.phone = phone;
      if (dob) patient.dob = dob;
      if (gender) patient.gender = gender;

      await patient.save();

      res.json({
        success: true,
        message: "Profile updated successfully"
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error updating profile"
      });
    }
  }
);



module.exports = router;
