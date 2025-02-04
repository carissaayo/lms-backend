import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import {
  generateToken,
  transporter,
} from "../middlewares/emailVerification.js";

// chnage password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // check if three passwords are provided
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(401).json({ message: "password(s) not provided" });
    }

    const getUser = await User.findById({ _id: req.user.id });

    // comparing the provided 'currentPassword' with the hashedPassword in the DB
    const comparePassword = await bcrypt.compare(
      currentPassword,
      getUser.password
    );

    if (!comparePassword) {
      return res
        .status(401)
        .json({ message: "current password isn't correct" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(401).json({ message: "passwords do not match" });
    }

    // if the passwords match, hash the new password and replace the old password in DB with it
    if (newPassword === confirmNewPassword) {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(process.env.SALTROUNDS)
      );
      console.log(hashedPassword);

      await User.findByIdAndUpdate(
        { _id: req.user.id },
        { password: hashedPassword },
        { new: true }
      );
    }
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("error changing password", error);
    res.status(500).json({ message: "Changing password failed" });
  }
};

export const requestResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (email !== req.user.email) {
      return res
        .status(403)
        .json({ message: "email is different from the registered one " });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "no user found with the email" });
    }
    const token = generateToken(email);
    const port = process.env.PORT || 8080;

    // Send password reset email
    const resetLink = `http://localhost:${port}/api/reset-password?token=${token}`;

    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Reset your password",
        html: `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
      },
      (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ message: "Failed to send email" });
        }

        console.log("Email sent:", info.response);
        return res.status(200).json({ message: "Password reset email sent" });
      }
    );
  } catch (error) {
    console.log("error requesting reset", error);
    res.status(500).json({ message: "Requesting reset failed" });
  }
};

export const createNewPassword = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "no user found with the email" });
    }

    return res.send(`
      <h1>Reset Password</h1>
      <form action="/api/reset-password" method="POST">
        <input type="hidden" name="token" value="${token}" />
        <label for="password">New Password:</label>
        <input type="password" name="password" required />
        <button type="submit">Reset Password</button>
      </form>
    `);
  } catch (error) {
    console.log("error requesting reset", error);
    res.status(500).json({ message: "Requesting reset failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const updateUser = await User.findOne({ email: decoded.email });

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALTROUNDS)
    );
    await User.findByIdAndUpdate(
      { _id: updateUser.id },
      { password: hashedPassword },
      { new: true }
    );
    res.send("<h1>Password reset successfully!</h1>");
  } catch (error) {
    console.log("error requesting reset", error);
    res.status(500).json({ message: "Requesting reset failed" });
  }
};
