// backend/server.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 4000;

import userRouter from './routes/useRoute.js';
import taskRouter from './routes/taskRoute.js';



// Middleware to parse JSON requests
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connect
connectDB();

// Routes
app.use('/api/user' , userRouter);
app.use('/api/tasks' , taskRouter);

app.get('/', (req, res) => {
    res.send('API is working');
})

app.listen(PORT , () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});