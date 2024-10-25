import express from "express";
import adminMiddleware from "../middlewares/adminMiddleware";
import { manageAccess, revokeUser, suspendUser } from "../controllers/adminController";

const router = express.Router();

router.post('/manage/suspend', adminMiddleware, suspendUser);
router.post('/manage/revoke', adminMiddleware, revokeUser);
router.post('/manage/access', adminMiddleware, manageAccess);

export default router;