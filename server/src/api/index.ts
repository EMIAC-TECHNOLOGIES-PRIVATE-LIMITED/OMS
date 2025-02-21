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

const app = express();
app.use(express.json());
app.use(cookieParser());


const allowedOrigins = [
    'http://localhost:3000',    // Local development
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
