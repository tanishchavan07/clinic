const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["patient", "doctor", "receptionist", "scheduler"],
      required: true
    },

    authProvider: {
      type: String,
      enum: ["google", "local"],
      required: true
    },

    // Username for patient & staff
    username: {
      type: String
    },

    // Email (mainly for patient)
    email: {
      type: String
    },

    // Google login support
    googleId: {
      type: String
    },

    password: {
      type: String
    },
    mobile: {
      type: String
    },
    // // age: {
    //   type: String
    // },
    dob: {
    type: Date,
    
  },

    gender: {
      type: String
    },

    name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
