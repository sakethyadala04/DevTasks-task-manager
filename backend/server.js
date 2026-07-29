import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";
import userRouter from "./routes/useRoute.js";
import taskRouter from "./routes/taskRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("DevTasks API is running 🚀");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});