// backend/routes/taskRoute.js

import express from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/TaskController.js';
import authMiddleware from '../middleware/auth.js';

const taskRouter = express.Router();

taskRouter.route('/op')
    .get(authMiddleware, getTasks)
    .post(authMiddleware, createTask);

taskRouter.route('/:id/op')
    .get(authMiddleware, getTaskById)
    .put(authMiddleware, updateTask)
    .delete(authMiddleware, deleteTask)

export default taskRouter;

