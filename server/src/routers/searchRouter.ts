import express from "express";
import { prismaClient } from "../utils/prismaClient";

const router = express.Router();

router.get('/:model', async (req, res) => {
    try {
        const { model } = req.params;
        const { column, value } = req.query;

        if (!model || !column || !value) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const selectQuery = model === 'client' || model === 'vendor' ? {
            id: true,
            name: true
        } : {
            id: true,
            website: true
        };

        const data = await ((prismaClient[model as keyof typeof prismaClient] as any).findMany({
            where: {
                [column as string]: {
                    contains: value as string,
                    mode: "insensitive"
                }
            },
            select: selectQuery,
            take: 10
        }));

        res.json(data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:model/:id', async (req, res) => {
    try {
        const { model, id } = req.params;

        if (!model || !id) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const data = await ((prismaClient[model as keyof typeof prismaClient] as any).findUnique({
            where: {
                id: parseInt(id)
            }
        }));

        if (!data) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Fetch by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
