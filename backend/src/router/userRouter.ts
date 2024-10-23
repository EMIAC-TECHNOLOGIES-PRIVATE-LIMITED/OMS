import express from "express";
import { signInController, signUpController } from "../controllers/userController";
const router = express.Router();

router.post('/signup', signUpController);
router.post('/signin', signInController);

export default router;