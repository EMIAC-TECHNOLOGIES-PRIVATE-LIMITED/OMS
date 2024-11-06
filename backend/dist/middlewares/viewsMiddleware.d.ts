import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/sitesDataTypes';
declare const viewsMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export default viewsMiddleware;
