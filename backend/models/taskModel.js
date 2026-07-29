// backend/models/taskModel.js

import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        default: '',
        trim: true,
    },

    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'], default: 'Low'
    },

    duedate: {
        type: Date,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    completed: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const Task = mongoose.models.task || mongoose.model('task', TaskSchema);
export default Task;