import { Request, Response } from "express";
import 'dotenv/config';
export declare function signUpController(req: Request, res: Response): Promise<Response>;
export declare function signInController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
