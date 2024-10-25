import { Request, Response } from 'express';
import prismaClient from '../utils/prismaClient';

interface AuthRequest extends Request {
    user?: {
        email: string;
        userId: number;
        permissions: any[];
        resources: any[];
    };
    allowedColumns?: string[];
}

export async function masterDataController(req: AuthRequest, res: Response) {
    try {
        const allowedColumns = req.allowedColumns;

        if (!allowedColumns || allowedColumns.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No columns are allowed for you to access'
            });
        }

        // Construct the select object dynamically
        const selectFields = allowedColumns.reduce((acc: any, column: string) => {
            acc[column] = true;
            return acc;
        }, {});

        const data = await prismaClient.masterData.findMany({
            select: selectFields,
        });

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Error fetching master data:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
