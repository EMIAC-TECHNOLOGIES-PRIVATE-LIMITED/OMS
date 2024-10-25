"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const masterDataMiddleware_1 = __importDefault(require("../middlewares/masterDataMiddleware"));
const masterDataController_1 = require("../controllers/masterDataController");
const router = express_1.default.Router();
router.post('/masterData', masterDataMiddleware_1.default, masterDataController_1.masterDataController);
exports.default = router;
