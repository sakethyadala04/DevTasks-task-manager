import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { verifyGoogleToken } from "../services/googleAuthService.js";

import { generateVerificationToken, hashToken } from "../utils/tokenUtils.js";
import Task from "../models/taskModel.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const TOKEN_EXPIRES = '24h';

// helper to create token
const createToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// Register

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = generateVerificationToken();

    // Hash token before storing
    const hashedVerificationToken = hashToken(verificationToken);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    });

    // Send verification email
    await sendVerificationEmail({
      email: newUser.email,
      name: newUser.name,
      token: verificationToken,
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });

  } catch (err) {
    console.error("registerUser error:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is missing",
      });
    }

    // Hash the received token
    const hashedToken = hashToken(token);

    // Find the user with this token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Verify the user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
    });

  } catch (error) {
    console.error("verifyEmail error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    const user = await User.findOne({ email });

    // Always return the same response for security
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();

    // Store hashed token
    user.resetPasswordToken = hashToken(resetToken);

    // Expire after 24 hours
    user.resetPasswordTokenExpires =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });

  } catch (error) {
    console.error("forgotPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Check required fields
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash the received token
    const hashedToken = hashToken(token);

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link.",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now sign in.",
    });

  } catch (error) {
    console.error("resetPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before signing in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user._id);

    return res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (err) {
    console.error("loginUser error:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET CURRENT USER
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      {
        new: true,
        runValidators: true,
        select: "name email",
      }
    );

    return res.json({
      success: true,
      user: updated,
    });

  } catch (err) {
    console.error("updateProfile error:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password (min 8 chars)' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Google Login

export const googleLogin = async (req, res) => {

  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const googleUser = await verifyGoogleToken(credential);

    if (!googleUser.emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    let user = await User.findOne({ email: googleUser.email });

    // New user -> create account
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        password: null,
        googleId: googleUser.googleId,
        avatar: googleUser.picture,
        isVerified: true,
      });
    }

    // Existing user -> link Google account if not already linked

    user.isVerified = true;

    if (!user.googleId) {
      user.googleId = googleUser.googleId;
    }

    if (!user.avatar) {
      user.avatar = googleUser.picture;
    }

    if (user.isModified()) {
      await user.save();
    }

    // Generate our application's JWT
    const token = createToken(user._id);

    // Send response
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });

  } catch (error) {
    console.error("googleLogin error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Resend Verification Email

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    const users = await User.find();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified.",
      });
    }

    const verificationToken = generateVerificationToken();

    user.verificationToken = hashToken(verificationToken);
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken,
    });

    return res.status(200).json({
      message: "Verification email sent successfully.",
    });

  } catch (error) {
    console.error("resendVerificationEmail error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    // Check if the user exists
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Delete all tasks belonging to the user
    await Task.deleteMany({ owner: req.userId });

    // Delete the user account
    await User.findByIdAndDelete(req.userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });

  } catch (err) {
    console.error("deleteAccount error:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

