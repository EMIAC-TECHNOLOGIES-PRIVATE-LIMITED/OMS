import express from "express";
import { salesController } from "../controllers/salesController";
import salesMiddleware from "../middlewares/salesMiddleware";

const router = express.Router();

router.post('/', salesMiddleware ,salesController);

export default router;