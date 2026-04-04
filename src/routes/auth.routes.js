import express from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/get-me", authController.getMe);
authRouter.get("/refresh-token", authController.refreshToken);
authRouter.get("/logout", authController.logout);
authRouter.get("/logout-all", authController.logoutFromAllDevices);
authRouter.get("/verify-email", authController.verifyEmail);

export default authRouter;
