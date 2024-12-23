import express from "express";
import { signInController, signOutController, signUpController } from "../controllers/userController";
import { userMiddleware } from "../middlewares/userMiddleware";
import { userInfo } from "../controllers/userController";
const router = express.Router();

router.post('/signup', signUpController);
router.post('/signin', signInController);
router.post('/signout', signOutController)

router.get('/me', userMiddleware, userInfo);

export default router;