const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const User = require("./models/User");
const medicineRoutes = require("./routes/medicine");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connection successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
main().catch(console.error);

// Auth Routes
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields (username, email, password) are required",
      });
    }
    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Medicine API Routes
app.use("/medicines", medicineRoutes);

// Chatbot Route
app.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  const messages = [...history, { role: "user", content: message }];

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
});

// Summary Route
app.post("/summary", async (req, res) => {
  const { history } = req.body;

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

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running on port 3000");
});

// Catch-All Route for 404s
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
