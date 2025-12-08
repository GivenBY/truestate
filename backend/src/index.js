import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.config.js";
import salesRoutes from "./routes/sales.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

db.connectDB();

app.get("/", (req, res) => {
  res.status(200).send({ message: "TruEstate Sales API is running." });
});

app.use("/api/sales", salesRoutes);

app.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});
