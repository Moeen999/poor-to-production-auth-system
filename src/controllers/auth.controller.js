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

    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, //! this line refers to that the script of js which will run on the browser side will never be able to read the cookies data
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error creating account",
    });
    console.log(error);
  }
}

async function getMe(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({
        message: "Un-Authorized! token not found",
      });
    }

    const decodedToken = jwt.verify(token, configs.JWT_SECRET);
    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "user fetched successfully!",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error creating account",
    });
    console.log(error);
  }
}

async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Un-Authorized! refresh token not found",
      });
    }

    const decodedToken = jwt.verify(refreshToken, configs.JWT_SECRET);
    const accessToken = jwt.sign(
      {
        id: decodedToken.id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const newRefreshToken = jwt.sign(
      {
        id: decodedToken.id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Access token refreshed succesfully",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error creating account",
    });
    console.log(error);
  }
}

export { register, getMe, refreshToken };
