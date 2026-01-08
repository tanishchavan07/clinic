const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true
    },

    age: {
      type: Number,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    appointmentTime: {
      type: String,
      required: true
    },

    patientEmail: {
    type: String,
    required: true
    },

    status: {
      type: String,
      default: "Pending"
    }
  },
  { timestamps: true }
);

appointmentSchema.index(
  { appointmentTime: 1 },
  { unique: true }
);
module.exports = mongoose.model("Appointment", appointmentSchema);

