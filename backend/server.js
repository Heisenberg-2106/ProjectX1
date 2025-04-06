const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jwtoken");
const User = require("./models/User");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const http = require("http"); // Added for Socket.IO
const { Server } = require("socket.io"); // Added for Socket.IO

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Match frontend URL
    methods: ["GET", "POST"],
  },
});

const medicineRoutes = require("./routes/medicine");
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate critical environment variables
if (!MONGODB_URI || !OPENROUTER_API_KEY || !JWT_SECRET) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connection successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

main().catch(console.error);

// Registration Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields (username, email, password) are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    console.log("User registered and saved to MongoDB:", user);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("User logged in:", user.email);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Medicine API Routes
app.use("/medicines", medicineRoutes);

// Chatbot Route
app.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  // Validate input
  if (!message || !Array.isArray(history)) {
    return res.status(400).json({ message: "Message and history array are required" });
  }

  // Add system prompt to restrict to medical topics
  const messages = [
    {
      role: "system",
      content: "You are a helpful and knowledgeable medical assistant. Only answer questions strictly related to health, medicine, diseases, treatments, symptoms, and wellness. If a question is unrelated to health, politely decline to answer."
    },
    ...history,
    { role: "user", content: message }
  ];

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("❌ Error calling OpenRouter API:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from AI model" });
  }
})


// Summary Route
app.post("/summary", async (req, res) => {
  const { history } = req.body;
  if (!Array.isArray(history)) {
    return res.status(400).json({ message: "History array is required" });
  }
  const messages = [
    { role: "system", content: "Summarize this medical conversation for a doctor." },
    ...history,
  ];
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error("❌ Error calling summary API:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to summarize conversation" });
  }
});

// Socket.IO Signaling for WebRTC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Root Route
app.get("/", (req, res) => {
  res.send(`Server is running on port ${PORT}`); // Updated to reflect actual port
});

// Catch-All Route for 404s
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});