const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // 🔗 Link to appointment
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    // 🔗 Patient reference
    patientEmail: {
      type: String,
      required: true
    },

    // 👤 Patient snapshot
    patientName: {
      type: String,
      required: true
    },

    dob: {
      type: Date,
      required: true
    },

    // 🩺 Medical details
    disease: {
      type: String,
      required: true
    },

    symptoms: {
      type: String
    },

    // 💊 Medicines
    medicines: [
      {
        name: String,
        dosage: String,
        timing: String
      }
    ],

    // 📝 Doctor notes
    doctorNotes: {
      type: String
    },

    // 💰 Fees
    fees: {
      type: Number,
      required: true
    },

    // 👨‍⚕️ Doctor
    doctorName: {
      type: String,
      required: true
    },

    // 🧾 NEW: Report Type
    reportType: {
      type: String,
      required: true
      // examples: "Blood Test", "X-Ray", "OPD", "General Checkup"
    },

    // 📅 NEW: Report Date
    reportDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
