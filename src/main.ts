import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ragRoutes from "./routes/ragRoutes";
import authRoutes from "./routes/authRoutes";
import MongoService from "./helpers/MongoDb";

const app = express();
app.use(express.json());
const allowedOrigins = [
  "https://ragappfrontend.onrender.com",
  "http://localhost:5173",
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use("/auth", authRoutes);
app.use("/rag", ragRoutes);

const PORT = 3000;

MongoService.connect(process.env.MONGO_CONN_STRING!)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });
