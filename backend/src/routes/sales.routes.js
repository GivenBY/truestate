import express from "express";
import { getSalesData } from "../controllers/sales.controller.js";

const router = express.Router();
router.get("/", getSalesData);

export default router;
