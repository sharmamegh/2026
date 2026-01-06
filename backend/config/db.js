import mongoose from "mongoose";

const connectDB = async () => {
  let mongoUri;
  try {
    mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tiny-tools";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(
      `Failed to connect to MongoDB at ${mongoUri}: ${error.message}`
    );
    process.exit(1);
  }
};

export default connectDB;
