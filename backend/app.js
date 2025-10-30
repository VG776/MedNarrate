import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './login/db.js';
import authRoutes from './login/authRoutes.js';
import reportRoutes from './login/reportRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(cookieParser()); // Required for cookies

// Routes
app.get('/', (req, res) => {
  res.send('🔐 MedNarrate Auth API running');
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Start server
const PORT = process.env.AUTH_PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🔐 Auth server running on port ${PORT}`);
  console.log('✅ MongoDB connection active');
  console.log('✅ User authentication available');
  console.log('✅ Report history available\n');
});