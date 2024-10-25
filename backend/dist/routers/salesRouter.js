"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesController_1 = require("../controllers/salesController");
const salesMiddleware_1 = __importDefault(require("../middlewares/salesMiddleware"));
const router = express_1.default.Router();
router.post('/', salesMiddleware_1.default, salesController_1.salesController);
exports.default = router;
