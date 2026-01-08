const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    // 🔗 Appointment reference
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    // 👤 Patient snapshot (from Appointment)
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

    // 💰 Consultation fee (from Report)
    consultationFees: {
      type: Number,
      required: true
    },

    // 💊 Medicines (names from Report, prices by Receptionist)
    medicines: [
      {
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],

    // 🧮 Calculated totals
    medicinesTotal: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    // 💳 Payment status
    billStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
