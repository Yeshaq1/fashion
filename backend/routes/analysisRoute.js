import express from "express";
import { getProductAnalysis } from "../controllers/analysisController.js";

const router = express.Router();

router.route("/").post(getProductAnalysis);

export default router;