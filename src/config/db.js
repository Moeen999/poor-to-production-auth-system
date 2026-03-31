import mongoose from "mongoose";
import configs from "./config.js";

async function connectDB() {
  try {
    await mongoose.connect(configs.MONGO_URI + "/auth-sys");
    console.log("DB connected successfully!");
  } catch (error) {
    console.log("Error connecting DB", error);
  }
}

export default connectDB;
