const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://tanishchavan:tanish123@cluster0.1bhopit.mongodb.net/ClinicDB");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed");
    process.exit(1);
  }
};

module.exports = connectDB;
