import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ragRoutes from "./routes/ragRoutes";
import authRoutes from "./routes/authRoutes";
import { initChroma } from "./services/ragService";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/auth", authRoutes);
app.use("/rag", ragRoutes);

const PORT = 3000;

mongoose
  .connect(process.env.MONGO_CONN_STRING!)
  .then(() => {
    console.log("Connected to MongoDB");
    return initChroma();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
