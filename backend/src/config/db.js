import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async (mongoUri = process.env.MONGO_URI) => {
  if (!mongoUri) throw new Error("MONGO_URI is not defined");
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    // options in mongoose 7 are mostly automatic
  });
  logger.info("Connected to MongoDB");
};

export default connectDB;
