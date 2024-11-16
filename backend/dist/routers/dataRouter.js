"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const viewsMiddleware_1 = __importDefault(require("../middlewares/viewsMiddleware"));
const viewsController_1 = require("../controllers/viewsController");
router.get('/:resource/:viewId?', viewsMiddleware_1.default, viewsController_1.viewsController.getView);
router.post('/:resource', viewsMiddleware_1.default, viewsController_1.viewsController.createView);
router.post('/:resource/data', viewsMiddleware_1.default, viewsController_1.viewsController.getData);
router.put('/:resource/:viewId?', viewsMiddleware_1.default, viewsController_1.viewsController.updateView);
router.delete('/:resource/:viewId', viewsMiddleware_1.default, viewsController_1.viewsController.deleteView);
exports.default = router;
