import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const TOKEN_EXPIRES = '24h';

// helper to create token
const createToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all the fields' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed });

    const token = createToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: "Successfully Registered",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (err) {
    console.error('registerUser error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user._id);
    return res.json({ success: true, message: "Login in successfully", user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('loginUser error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
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
    const { name, email } = req.body;
    if (!name || !email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid name and email' });
    }

    const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use by another account' });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true, runValidators: true, select: 'name email' }
    );

    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
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