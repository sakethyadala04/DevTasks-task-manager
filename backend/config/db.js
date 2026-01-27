import mongoose from 'mongoose';

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://sakethyadala2004_db_user:DevTasks24@cluster0.iot3rgq.mongodb.net/DevTasks')
    .then(() => {
        console.log('MongoDB connected successfully');
    });
}