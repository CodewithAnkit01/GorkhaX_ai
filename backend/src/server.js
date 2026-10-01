import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Status:Running Port:${PORT} Environment: ${process.env.NODE_ENV || "development"}`);
});


const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down...`);

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));