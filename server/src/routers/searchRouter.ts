import express from "express";
import { prismaClient } from "../utils/prismaClient";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/sitesDataTypes";
import { getResourceCached } from '../utils/getPermissions';
import { secondaryQueryBuilder } from "../utils/queryBuilder";
import { PrismaModelInfo } from "../utils/prismaModelInfo";
import { flattenData } from "../utils/flatData";



const router = express.Router();
const modelInfo = new PrismaModelInfo();

router.get('/:model', async (req, res) => {
    try {
        const { model } = req.params;
        const { column, value } = req.query;
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token is missing' });
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;

        const permittedColumns = await getResourceCached(decoded.userId);
        const fullColumn = `${model.toLowerCase()}.${column}`;
        const query = {
            filters: [
                {
                    column: fullColumn as string,
                    operator: 'contains',
                    value: value as string
                }
            ]
        }

        let nestedQuery = secondaryQueryBuilder(model, permittedColumns, query);



        if (!model || !column || !value) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (model === 'client') {
            nestedQuery.where = {
                pocId: decoded.userId
            }
        }

        if (model === 'site') {
            nestedQuery = {
                ...nestedQuery,
                orderBy: {
                    costPrice: 'asc'
                }
            };


            const rawData = await ((prismaClient[model as keyof typeof prismaClient] as any).findMany({
                ...nestedQuery,
                take: 30
            }));



            let uniqueResults: any[] = [];
            let seenValues = new Set();


            const columnName = column as string;

            for (const item of rawData) {
                const columnValue = item[columnName];


                if (!seenValues.has(columnValue)) {
                    seenValues.add(columnValue);
                    uniqueResults.push(item);

                    // Break once we have 10 unique results
                    if (uniqueResults.length === 10) break;
                }
            }

            let columnTypes = modelInfo.getModelColumns(model);

            const availableColumnsType = Object.fromEntries(
                Object.entries(columnTypes).filter(([key]) => permittedColumns.includes(key))
            );

            const flatCols = Object.keys(availableColumnsType).reduce((acc, key) => {
                const newKey = key.charAt(0).toLowerCase() + key.slice(1);
                acc[newKey] = availableColumnsType[key];
                return acc;
            }, {} as Record<string, string>);

            const flatData = flattenData(uniqueResults, model.toLowerCase(), flatCols);

            return res.json(flatData);
        }


        const data = await ((prismaClient[model as keyof typeof prismaClient] as any).findMany({
            ...nestedQuery,
            take: 10
        }));

        let columnTypes = modelInfo.getModelColumns(model);

        const availableColumnsType = Object.fromEntries(
            Object.entries(columnTypes).filter(([key]) => permittedColumns.includes(key))
        );

        const flatCols = Object.keys(availableColumnsType).reduce((acc, key) => {
            const newKey = key.charAt(0).toLowerCase() + key.slice(1);
            acc[newKey] = availableColumnsType[key];
            return acc;
        }, {} as Record<string, string>);


        const flatData = flattenData(data, model.toLowerCase(), flatCols);

        res.json(flatData);
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
