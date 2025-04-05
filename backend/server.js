const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

main().catch((err) => console.log(err));

const MONGODB_URI = process.env.MONGODB_URI;

main();

// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connection successful");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}


