const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // Ensure this path is correct

// Registration Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields (username, email, password) are required",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create and save the new user
    const user = new User({
      username,
      email,
      password: hashedPassword, // Save hashed password
    });
    await user.save();

    // Log to confirm the user was saved
    console.log("User registered and saved to MongoDB:", user);

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send response
    res.status(201).json({ token });
  } catch (error) {
    console.error("Registration error:", error); // Log error for debugging
    res.status(400).json({ message: error.message });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log successful login
    console.log("User logged in:", user.email);

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send response
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error); // Log error for debugging
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
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT not set in .env
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
