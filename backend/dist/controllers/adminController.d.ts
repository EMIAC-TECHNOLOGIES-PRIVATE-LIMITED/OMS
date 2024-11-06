import { Request, Response } from 'express';
export declare function suspendUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function revokeUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function manageAccess(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
