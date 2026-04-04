import nodemailer from "nodemailer";
import configs from "../config/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    clientId: configs.GOOGLE_CLIENT_ID,
    clientSecret: configs.GOOGLE_CLIENT_SECRET,
    refreshToken: configs.GOOGLE_REFRESH_TOKEN,
    user: configs.GOOGLE_USER,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${configs.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
