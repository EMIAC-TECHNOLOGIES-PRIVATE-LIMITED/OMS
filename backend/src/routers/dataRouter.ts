import express from "express";
import masterDataMiddleware from "../middlewares/masterDataMiddleware";
import { masterDataController } from "../controllers/masterDataController";

const router = express.Router();

router.post('/masterData', masterDataMiddleware ,masterDataController);

export default router;