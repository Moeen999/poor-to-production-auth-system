import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import configs from "../config/config.js";
import sessionModel from "../models/session.model.js";

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

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    //! Sessions
    const session = await sessionModel.create({
      user: user._id,
      refreshToken: refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "15m",
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
      message: error.message || "Unknown Error Occured",
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

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshToken: refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

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

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    session.refreshToken = newRefreshTokenHash;
    await session.save();

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
      message: error.message || "Unknown Error Occured",
    });
    console.log(error);
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not found!",
      });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshToken: refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(400).json({
        message: "Session not found || Invalid Refresh Token!",
      });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged Out Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Unknown Error Occured",
    });
    console.log(error);
  }
}

export { register, getMe, refreshToken, logout };
