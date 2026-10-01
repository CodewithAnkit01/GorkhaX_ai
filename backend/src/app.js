import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(errorHandler);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GorkhaX AI API is running",
    timestamp: new Date().toISOString(),
  });
});



app.use("/api/v1/auth", authRoutes);

export default app;