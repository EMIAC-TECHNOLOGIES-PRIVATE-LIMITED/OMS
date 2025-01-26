import express from "express";
import { prismaClient } from "../utils/prismaClient";


const router = express.Router();

router.get('/:model', async (req, res) => {

    const { model } = req.params;
    const { column, value } = req.query;

    const data = await ((prismaClient[model as keyof typeof prismaClient] as any).findMany({
        where: {
            [column as string]: {
                contains: value as string,
                mode: "insensitive"
            }
        },
        select: {
            id: true,
            name: true
        },
        take: 10
    }));

    res.json(data);
});

export default router;
