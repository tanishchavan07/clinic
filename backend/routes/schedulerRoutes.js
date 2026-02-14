const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const protect = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const Report = require("../models/Report");
const User = require("../models/user");

// 1️⃣ Scheduler - View all pending appointment requests
router.get( "/pending",  protect ,  allowRole("scheduler"),  async (req, res) => {
    try {
      const pendingAppointments = await Appointment.find({
        status: "Pending"
      });

      res.json({
        success: true,
        appointments: pendingAppointments
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching pending appointments"
      });
    }
  }
);

// 2️⃣ Scheduler - Accept or Reject appointment
// action = "approve" | "reject"
router.post("/update-status",  protect,  allowRole("scheduler"),  async (req, res) => {
    try {
      const { appointmentId, action } = req.body;

      if (!appointmentId || !["approve", "reject"].includes(action)) {
        return res.json({
          success: false,
          message: "Invalid request"
        });
      }

      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.json({
          success: false,
          message: "Appointment not found"
        });
      }

      appointment.status =
        action === "approve" ? "Approved" : "Rejected";

      await appointment.save();

      res.json({
        success: true,
        message:
          action === "approve"
            ? "Appointment approved successfully"
            : "Appointment rejected successfully"
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error updating appointment status"
      });
    }
  }
);

// Scheduler - View patient list
router.get("/patients",  protect,  allowRole("scheduler"),  async (req, res) => {
    try {
      const patients = await User.find(
        { role: "patient" },
        {
          name: 1,
          email: 1,
          mobile: 1,
          dob: 1,
          gender: 1,
          createdAt: 1
        }
      );

      res.json({
        success: true,
        patients
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching patient list"
      });
    }
  }
);

// Scheduler - Delete patient
router.delete("/patient/:patientId",  protect,  allowRole("scheduler"),  async (req, res) => {
    try {
      const { patientId } = req.params;

      const patient = await User.findOne({
        _id: patientId,
        role: "patient"
      });

      if (!patient) {
        return res.json({
          success: false,
          message: "Patient not found"
        });
      }

      await patient.deleteOne();

      res.json({
        success: true,
        message: "Patient deleted successfully"
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error deleting patient"
      });
    }
  }
);

// Scheduler - View patient appointments
router.get("/patient/:patientEmail/appointments",  protect,  allowRole("scheduler"),
  async (req, res) => {
    try {
      const { patientEmail } = req.params;

      const appointments = await Appointment.find({
        patientEmail,
        status: { $in: ["Approved", "Reported", "Paid"] }
      });

      res.json({
        success: true,
        appointments
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching patient appointments"
      });
    }
  }
);

router.get("/report-types", protect, allowRole("scheduler"), async (req, res) => {
    try {
      const types = await Report.distinct("reportType");

      res.json({
        success: true,
        reportTypes: types
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching report types"
      });
    }
  }
);

router.get("/reports/:type",  protect,  allowRole("scheduler"),  async (req, res) => {
    try {
      const { type } = req.params;

      const reports = await Report.find({
        reportType: type
      });

      res.json({
        success: true,
        reports
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching reports"
      });
    }
  }
);

module.exports = router;
