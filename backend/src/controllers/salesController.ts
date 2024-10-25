import { Request, Response } from "express";

export async function salesController(req : Request, res : Response) {
    return res.status(200).json({message : "Authorized Sales Route : To be only accessed by Sales Dept."})
}