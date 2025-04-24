import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import userRouter from '../routers/userRouter'
import dataRouter from '../routers/dataRouter'
import adminRouter from "../routers/adminRouter";
import toolsRouter from "../routers/toolsRouter";
import searchRouter from "../routers/searchRouter";
import { APIError } from '../utils/apiHandler';

// temp imports : 
import bcrypt from 'bcrypt';
import { prismaClient } from '../utils/prismaClient';
import STATUS_CODES from '../constants/statusCodes';
import { APIResponse } from '../utils/apiHandler';
import logger from '../logger';


const app = express();
app.use(express.json( {limit: '50mb'}));
app.use(cookieParser());



// const allowAllOrigins = (req: Request, res: Response, next: NextFunction) => {
//     res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS'); // Define allowed methods
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     if (req.method === 'OPTIONS') {
//         return res.sendStatus(200); 
//     }
//     next();
// };

// // Temporary update data route
// app.post('/api/temp/updateUser', allowAllOrigins, async (req: Request, res: Response) => {

//     const body = req.body;

//     if (!body.userId || !body.name || !body.password || !body.roleId || typeof body.suspended === 'undefined') {
//         return res.status(STATUS_CODES.BAD_REQUEST).json(
//             new APIError(
//                 STATUS_CODES.BAD_REQUEST,
//                 "Missing required fields",
//                 ["name, password, roleId, and suspended status are required"],
//                 false
//             ).toJSON()
//         );
//     }

//     const saltRounds = 10;
//     try {
//         const salt = await bcrypt.genSalt(saltRounds);
//         const hashedPassword = await bcrypt.hash(body.password, salt);

//         const user = await prismaClient.user.update({
//             where: { id: body.userId },
//             data: {
//                 name: body.name,
//                 password: hashedPassword,
//                 roleId: body.roleId,
//                 suspended: body.suspended,
//             }
//         });

//         return res.status(STATUS_CODES.OK).json(
//             new APIResponse(
//                 STATUS_CODES.OK,
//                 "User updated successfully",
//                 {
//                     userId: user.id,
//                 },
//                 true
//             ).toJSON()
//         );
//     } catch (error) {
//         console.error("User update failed:", error);
//         return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
//             new APIError(
//                 STATUS_CODES.INTERNAL_SERVER_ERROR,
//                 "User creation failed",
//                 [error instanceof Error ? error.message : "Unknown error"],
//                 false
//             ).toJSON()
//         );
//     }
// });


const allowedOrigins = [
    'http://localhost:3000',    // Local development
    'http://localhost:3001',    // Local development
    'https://localhost:3001',    // Local development
    'http://103.172.92.187',   // VM IP for deployment
    'https://oms.emiactech.com',
    'https://emiactech.com',
    'https://www.emiactech.com',
    'http://oms.emiactech.com',
    'http://emiactech.com',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Required for cookies
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof APIError) {
        return res.status(err.status).json({
            status: err.status,
            message: err.message,
            errors: err.errors,
            success: err.success
        });
    }
    next(err);
});


const port = process.env.PORT || 3000;

app.get('/api/v1/health', (req, res) => {
    logger.info('Health Check');
    res.send('Perfect Health');
})

app.use('/api/v1/user', userRouter);
app.use('/api/v1/data', dataRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/tools', toolsRouter);
app.use('/api/v1/search', searchRouter);



app.listen(3000, '0.0.0.0', () => {
    console.log(`Server Started at port : ${port}`);
})
