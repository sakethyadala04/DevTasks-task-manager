// backend/controllers/TaskController.js

import Task from '../models/taskModel.js';

// craete a new task
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, duedate, completed } = req.body;
        const task = new Task({
            title,
            description,
            priority,
            duedate,
            completed: completed === 'Yes' || completed === true,
            owner: req.user.id
        });
        const saved = await task.save();
        res.status(201).json({ message: 'Task created successfully', task: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// get all tasks for loggen in user

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 })
        res.json({ success: true, tasks });

    } catch (err) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// get a single task by ID (must belong to the same user)

export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id })
        if (!task)
            return res.status(404).json({ succcess: false, message: "Task not found" });

        res.json({ success: true, task });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// update a task

export const updateTask = async (req, res) => {
    try {
        const data = { ...req.body };

        if (data.completed !== undefined) {
            data.completed = Boolean(data.completed);
        }

        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            data,
            { new: true, runValidators: true }
        );

        if (!updated) res.status(404).json({
            success: false, message: 'Task not found or not yours'
        });
        
        res.json({ success: true, task: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}



// Delete a task

export const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findOneAndDelete({
            _id: req.params.id, owner: req.user.id
        })

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Task not fround or not yours" });
        }
        res.json({ success: true, message: "task deleted successfully" });
    } catch (err) {
        res.status(500).json({ successe: false, message: err.message });
    }
}