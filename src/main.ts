import "dotenv/config";
import express from "express";
import cors from "cors";
import ragRoutes from "./routes/ragRoutes";
import authRoutes from "./routes/authRoutes";
import MongoService from "./helpers/MongoDb";
import healthRoutes from "./routes/healthRoutes";

const app = express();
app.use(express.json());
const allowedOrigins = [
  "https://rag-app-front-2j30nmfus-shaunaks-projects-a027fef1.vercel.app",
  "https://rag-app-front-end.vercel.app",
  "https://rag-app-front-end-shaunaks-projects-a027fef1.vercel.app",
  "https://rag-app-front-end-git-main-shaunaks-projects-a027fef1.vercel.app",
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));


app.use("/auth", authRoutes);
app.use("/rag", ragRoutes);
app.use('/', healthRoutes);

const PORT = 3000;

MongoService.connect(process.env.MONGO_CONN_STRING!)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });
