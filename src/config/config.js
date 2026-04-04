import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("Mongo URI is not defined");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Google Client ID is not defined");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google Client Secret is not defined");
}

if (!process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error("Google Refresh Token is not defined");
}

if (!process.env.GOOGLE_USER) {
  throw new Error("Google User is not defined");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT Secret is not defined");
}

const configs = {
  MONGO_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER,
};

export default configs;
