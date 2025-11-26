import express from "express";
const openaiRouter = express.Router();
import { getStockInsightHandler } from "./openai.js";
openaiRouter.get("/", getStockInsightHandler);


export default openaiRouter;
