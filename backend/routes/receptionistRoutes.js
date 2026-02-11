const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const protect = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const Report = require("../models/Report");
const Bill = require("../models/Bill");
/**
 * Receptionist - View reported appointments
 */
router.get("/appointments",  protect,  allowRole("receptionist"),  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        status: "Reported"
      });

      res.json({
        success: true,
        appointments
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error fetching reported appointments"
      });
    }
  }
);

//NEW - Get report data for billing (medicines + fees only, no diagnosis)
router.get("/get-report-for-billing/:appointmentId", protect, allowRole("receptionist"), async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Fetch appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.status !== "Reported") {
      return res.json({
        success: false,
        message: "Report not available. Appointment must be in 'Reported' status."
      });
    }

    // Fetch report - only return necessary fields for billing
    const report = await Report.findOne({ appointmentId });
    if (!report) {
      return res.json({
        success: false,
        message: "Report not found. Doctor may not have submitted a report yet."
      });
    }

    // Return only medicine details and fees (not diagnosis/remarks)
    res.json({
      success: true,
      report: {
        fees: report.fees,
        medicines: report.medicines.map(med => ({
          name: med.name,
          dosage: med.dosage,
          timing: med.timing
        }))
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching report for billing"
    });
  }
});

// Receptionist - Create bill (medicine names from report)
router.post("/create-bill",  protect,  allowRole("receptionist"),  async (req, res) => {
    try {
      const { appointmentId, medicinePrices } = req.body;
      // medicinePrices = [{ name, price }]

      // 1️⃣ Fetch appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.status !== "Reported") {
        return res.json({
          success: false,
          message: "Bill can be created only for reported appointments"
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

      // 3️⃣ Match medicines & calculate total
      let medicinesTotal = 0;

      const medicines = report.medicines.map((med) => {
        const priceObj = medicinePrices.find(
          (m) => m.name === med.name
        );

        const price = priceObj ? priceObj.price : 0;
        medicinesTotal += price;

        return {
          name: med.name,
          price
        };
      });

      // 4️⃣ Total amount
      const totalAmount = report.fees + medicinesTotal;

      // 5️⃣ Create bill
      const bill = new Bill({
        appointmentId,
        patientName: appointment.patientName,
        dob: appointment.dob,
        address: appointment.address,
        consultationFees: report.fees,
        medicines,
        medicinesTotal,
        totalAmount
      });

      await bill.save();
      
      appointment.status = "Billed";
      await appointment.save();

      res.json({
        success: true,
        message: "Bill created successfully",
        bill
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error creating bill"
      });
    }
  }
);

// Receptionist - Appointment history (Paid)
router.get("/history", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      
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

// Receptionist - Appointment history (Unpaid)
router.get("/Unpaid", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      
      status: "Billed"
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

// Receptionist - Send payment reminder
router.post("/send-payment-reminder",  protect,  allowRole("receptionist"),  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      const appointment = await Appointment.findById(appointmentId);

      if (!appointment || appointment.status !== "Reported") {
        return res.json({
          success: false,
          message: "Payment reminder can be sent only for reported appointments"
        });
      }

      // 🔔 Notification logic (for now just simulated)
      // Later you can add email / SMS / WhatsApp here

      res.json({
        success: true,
        message: `Payment reminder sent to ${appointment.patientEmail}`
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Error sending payment reminder"
      });
    }
  }
);
module.exports = router;
