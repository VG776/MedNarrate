import express from 'express';
import jwt from 'jsonwebtoken';
import User from './userModel.js';
import Report from './reportModel.js';
import { authenticate } from './authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "2d" });
};

// REGISTER USER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      saveHistory: user.saveHistory,
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      saveHistory: user.saveHistory,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGOUT USER
router.post('/logout', async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET CURRENT USER
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      saveHistory: user.saveHistory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE SETTINGS (Enable/Disable History)
router.put('/settings', authenticate, async (req, res) => {
  const { saveHistory } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If disabling history, delete all existing reports
    if (user.saveHistory === true && saveHistory === false) {
      await Report.deleteMany({ userId: req.userId });
    }

    user.saveHistory = saveHistory;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      saveHistory: user.saveHistory,
      message: saveHistory ? "History enabled" : "History disabled and all reports deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ALL HISTORY MANUALLY
router.delete('/history', authenticate, async (req, res) => {
  try {
    const result = await Report.deleteMany({ userId: req.userId });
    res.json({ 
      message: `Deleted ${result.deletedCount} report(s)`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
