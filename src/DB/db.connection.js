import mongoose from "mongoose";
import {envConfig} from "../config/index.js";
const database = envConfig.database;


const dbConnection = async () => {
    try {
        await mongoose.connect(database.MONGO_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
    }
}

export default dbConnection;
