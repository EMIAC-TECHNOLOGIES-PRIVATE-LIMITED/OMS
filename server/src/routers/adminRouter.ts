import express from "express";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { createUser, getAllAccess, getRoleAccess, getRoles, getUserAccess, getUsers, manageRoleAccess, manageUserAccess, revokeUser, suspendUser } from "../controllers/adminController";

const router = express.Router();

router.get('/info/roles', adminMiddleware, getRoles)
router.get('/info/users', adminMiddleware, getUsers)

router.get('/info/access', adminMiddleware, getAllAccess)
router.post('/info/access/role', adminMiddleware, getRoleAccess)
router.post('/info/access/user', adminMiddleware, getUserAccess)

router.post('/manage/suspend', adminMiddleware, suspendUser);
router.post('/manage/revoke', adminMiddleware, revokeUser);
router.post('/manage/access/role', adminMiddleware, manageRoleAccess);
router.post('/manage/access/user', adminMiddleware, manageUserAccess);
router.post('/manage/createuser', adminMiddleware, createUser);
export default router;