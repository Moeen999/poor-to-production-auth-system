import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import configs from "../config/config.js";

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const isAlreadyReg = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyReg) {
      return res.status(409).json({
        message: "Username or email already exists.",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }
    const hashedPass = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await userModel.create({
      username,
      email,
      password: hashedPass,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error creating account",
    });
  }
}

export { register };
