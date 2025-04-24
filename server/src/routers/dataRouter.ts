import express from "express";
const router = express.Router();
import viewsMiddleware from "../middlewares/viewsMiddleware";
import { viewsController } from "../controllers/viewsController";
import { dataController } from "../controllers/dataController";
import { dataMiddleware } from "../middlewares/dataMiddleware";
import { dataRateLimiter } from "../middlewares/rateLimiter";

router.put('/updateOrder', dataMiddleware, dataController.updateOrder);

router.get('/getSiteCategories', dataController.getSiteCategories);

router.put('/:resource/update', dataMiddleware, dataController.updateData);
router.delete('/:resource/delete', dataMiddleware, dataController.deleteData);
router.put('/:resource/create', dataMiddleware, dataController.createData);

router.get('/:resource/:viewId?', viewsMiddleware, viewsController.getView);

router.post('/:resource', viewsMiddleware, viewsController.createView);
router.post('/:resource/data', viewsMiddleware, dataRateLimiter(), viewsController.getData);

router.put('/:resource/', viewsMiddleware, viewsController.updateView);
router.put('/:resource/columnOrder', viewsMiddleware, viewsController.updateColumnOrder);
router.delete('/:resource/', viewsMiddleware, viewsController.deleteView);


export default router;
