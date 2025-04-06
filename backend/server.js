const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const Tesseract = require("tesseract.js");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const medicineRoutes = require("./routes/medicine");
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

// Validate environment variables
if (!MONGODB_URI || !OPENROUTER_API_KEY || !JWT_SECRET || !API_KEY) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
}));

const upload = multer();

// Database connection
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

// API Key Middleware
const verifyApiKey = (req, res, next) => {
  const clientKey = req.headers["x-api-key"];
  if (clientKey !== API_KEY) {
    return res.status(403).json({ error: "Invalid API Key" });
  }
  next();
};

// Routes
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
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: error.message });
  }
});

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
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Prescription Scanning Route
app.post("/scan-prescription", verifyApiKey, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Enhanced medicine patterns
    const MEDICINE_PATTERNS = [
      // Pattern 1: "MedicineName 200mg take 2 times daily for 5 days"
      /([A-Za-z]+)\s+\d+\s*mg\s+(?:take\s+)?(\d+)\s*(?:times\s+)?daily\s+(?:for\s+)?(\d+)\s*days/gi,
      
      // Pattern 2: "Take MedicineName 500mg twice daily for 7 days"
      /Take\s+([A-Za-z]+)\s+\d+\s*mg\s+(?:once|twice|thrice|\d+\s*times)\s+daily\s+(?:for\s+)?(\d+)\s*days/gi,
      
      // Pattern 3: "MedicineName 200mg - 1 tab 2 times a day x 5 days"
      /([A-Za-z]+)\s+\d+\s*mg\s+-\s+\d+\s*tab\s+(\d+)\s*times\s+a\s+day\s+x\s+(\d+)\s*days/gi,
      
      // Pattern 4: Simple format "MedicineName 200mg 5 days"
      /([A-Za-z]+)\s+\d+\s*mg\s+(\d+)\s*days/gi
    ];

    const { data: { text } } = await Tesseract.recognize(req.file.buffer, "eng");
    
    let results = [];
    for (const pattern of MEDICINE_PATTERNS) {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const medicine = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        const frequency = match[2] ? parseInt(match[2]) : 1;
        const days = match[3] ? parseInt(match[3]) : (match[2] ? parseInt(match[2]) : 1);
        
        results.push({
          medicine,
          frequency,
          days_prescribed: days,
          matched_pattern: pattern.toString()
        });
      });
    }

    // Remove duplicates
    const uniqueResults = results.filter((v, i, a) => 
      a.findIndex(t => (t.medicine === v.medicine && t.days_prescribed === v.days_prescribed)) === i
    );

    res.json({
      extracted_text: text,
      prescription_details: uniqueResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ 
      error: "Failed to process image",
      details: error.message 
    });
  }
});

// Medicine API Routes
app.use("/medicines", medicineRoutes);

// Chatbot Route
app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !Array.isArray(history)) {
      return res.status(400).json({ message: "Message and history array are required" });
    }

    const messages = [
      {
        role: "system",
        content: "You are a helpful medical assistant. Provide accurate health information."
      },
      ...history,
      { role: "user", content: message }
    ];

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

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("Chat error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Summary Route
app.post("/summary", async (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history)) {
      return res.status(400).json({ message: "History array is required" });
    }

    const messages = [
      { role: "system", content: "Summarize this medical conversation for a doctor." },
      ...history,
    ];

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

    res.json({ summary: response.data.choices[0].message.content });
  } catch (err) {
    console.error("Summary error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to summarize conversation" });
  }
});

// WebSocket Signaling
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

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    version: "1.0.0",
    services: ["auth", "chat", "ocr", "webrtc"]
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 API Key required for /scan-prescription`);
  console.log(`💊 Medicine routes: /medicines`);
  console.log(`🤖 Chat endpoint: /chat`);
  console.log(`📝 Summary endpoint: /summary`);
  console.log(`📷 Prescription scan: /scan-prescription`);
});