import express from "express";
import { signInController, signOutController } from "../controllers/userController";
import { userMiddleware } from "../middlewares/userMiddleware";
import { userInfo } from "../controllers/userController";
const router = express.Router();


router.post('/signin', signInController);
router.post('/signout', signOutController)

router.get('/me', userMiddleware, userInfo);

export default router;