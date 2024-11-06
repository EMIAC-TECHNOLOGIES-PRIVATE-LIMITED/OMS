import { Response } from 'express';
import { AuthRequest } from '../types/sitesDataTypes';
export declare const viewsController: {
    getView: (req: AuthRequest, res: Response) => Promise<Response>;
    createView: (req: AuthRequest, res: Response) => Promise<Response>;
    updateView: (req: AuthRequest, res: Response) => Promise<Response>;
    deleteView: (req: AuthRequest, res: Response) => Promise<Response>;
};
