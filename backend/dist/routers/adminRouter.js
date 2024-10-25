"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminMiddleware_1 = __importDefault(require("../middlewares/adminMiddleware"));
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.post('/manage/suspend', adminMiddleware_1.default, adminController_1.suspendUser);
router.post('/manage/revoke', adminMiddleware_1.default, adminController_1.revokeUser);
router.post('/manage/access', adminMiddleware_1.default, adminController_1.manageAccess);
exports.default = router;
