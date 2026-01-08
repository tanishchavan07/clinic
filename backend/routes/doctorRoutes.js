const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const protect = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const Report = require("../models/Report");

// Doctor - View all approved appointments
router.get("/appointments",  protect,  allowRole("doctor"),  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        status: "Approved"
      });

      res.json({
        success: true,
        appointments
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching approved appointments"
      });
    }
  }
);

// Doctor - Make report for approved appointment
router.post("/make-report",  protect,  allowRole("doctor"),  async (req, res) => {
    try {
      const {
        appointmentId,
        disease,
        symptoms,
        medicines,
        doctorNotes,
        fees,
        reportType,
        reportDate
      } = req.body;

      // 1️⃣ Check appointment
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment || appointment.status !== "Approved") {
        return res.json({
          success: false,
          message: "Report can be created only for approved appointments"
        });
      }

      // 2️⃣ Create report
      const report = new Report({
        appointmentId: appointment._id,
        patientEmail: appointment.patientEmail,
        patientName: appointment.patientName,
        age: appointment.age,
        disease,
        symptoms,
        medicines,
        doctorNotes,
        fees,
        reportType,
        reportDate,
        doctorName: "Sai Sharma"
      });

      await report.save();

      // 3️⃣ Update appointment status
      appointment.status = "Reported";
      await appointment.save();

      res.json({
        success: true,
        message: "Report created successfully"
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error creating report"
      });
    }
  }
);

// Doctor - Cancel appointment (patient not arrived)
router.post( "/cancel-appointment",  protect,  allowRole("doctor"),  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      const appointment = await Appointment.findById(appointmentId);

      if (!appointment || appointment.status !== "Approved") {
        return res.json({
          success: false,
          message: "Only approved appointments can be cancelled"
        });
      }

      // Update status instead of deleting
      appointment.status = "Rejected";
      await appointment.save();

      res.json({
        success: true,
        message: "Appointment cancelled successfully"
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error cancelling appointment"
      });
    }
  }
);


module.exports = router;