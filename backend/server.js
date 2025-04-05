const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const User = require('./models/User');
const medicineRoutes = require('./routes/medicine');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB connection successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

main().catch((err) => console.log(err));

// Routes
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required' });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.use('/medicines', medicineRoutes);

// Root Route for Testing
app.get('/', (req, res) => {
  res.send('Server is running on port 3000');
});

// 404 Handler (Catch-all for undefined routes)
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Start Server
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT not set in .env
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});