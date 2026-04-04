export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOtpHtml(otp) {
  return `
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <p style="font-size: 24px; color: #555; margin: 20px 0;">${otp}</p>
          <p style="color: #777;">This OTP is valid for 10 minutes.</p>
        </div>
      </body>
    </html>
  `;
}
