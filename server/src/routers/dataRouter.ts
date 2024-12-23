import express from "express";
const router = express.Router();
import viewsMiddleware from "../middlewares/viewsMiddleware";
import { viewsController } from "../controllers/viewsController";


router.get('/:resource/:viewId?', viewsMiddleware, viewsController.getView);
router.get('/:resource/typeahead', viewsController.getTypeAhead);

router.post('/:resource', viewsMiddleware, viewsController.createView);
router.post('/:resource/data', viewsMiddleware, viewsController.getData);

router.put('/:resource/:viewId?', viewsMiddleware, viewsController.updateView);
router.delete('/:resource/:viewId', viewsMiddleware, viewsController.deleteView);

export default router;
