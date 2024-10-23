import express from 'express';
import cors from 'cors'; 
import 'dotenv/config';
import userRouter from '../router/userRouter'


const app = express();
app.use(express.json());

// TODO : remove cors and configure proxy from frontend
app.use(cors());

const port = process.env.PORT || 3000;

app.get('/api/v1/health', (req, res) => {
    res.send('Perfect Health');
})

app.use('/api/v1/user', userRouter); 

app.listen(port, () => {
    console.log(`Server Started at port : ${port}`);
})
