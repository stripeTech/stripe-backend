const express = require("express");
const mongoose = require("mongoose");
const ContactModel = require("./models/contact.model");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const blogModel = require("./models/blog.model");

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(helmet()); // Security headers

// Rate Limiting (Prevent abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

console.log("Server started", process.env.DB_URL);
// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/api", (req, res) => {
  res.send("Hello World");
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const contact = await ContactModel.create({ name, email, phone, subject, message });
    res.status(201).json({ message: "Submitted successfully", contact });
  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await blogModel.find().sort({ createdAt: -1 }).limit(10);
      res.status(200).json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

app.post("/api/blogs", async (req, res) => {
  try {
    const { url, title, image,content } = req.body;

    if (!url || !title || !image) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const blog = await blogModel.create({ url, title,content, image });
    res.status(201).json({ message: "Submitted successfully", blog });
  } catch (error) {
    console.error("Error submitting blog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
