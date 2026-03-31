import dotenv from "dotenv";
dotenv.config();

const configs = {
  MONGO_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
};

export default configs;
