import './config/env.config.js';
import express from "express";
import cors from 'cors'
import {envConfig , corsOptions} from './config/index.js';
import dbConnection from './DB/db.connection.js';
import { globalErrorHandler } from './Middlewares/index.js';
import * as controllers from './Modules/index.js';
import { NotFoundException, redisConnection } from './Common/index.js';
import helmet from 'helmet';

// Express app
const app = express();

// Port
const port = parseInt(envConfig.app.PORT || 3000);

// Database connection
dbConnection();

// Redis connection 
redisConnection()

// cors middleware
app.use(cors(corsOptions) , helmet() );

// uploads middleware
app.use('/uploads' , express.static('uploads'))

// Json parser
app.use(express.json());

//Controllers
app.use('/api/auth', controllers.authController);
app.use('/api/message', controllers.messageController);
app.use('/api/user', controllers.userController);

// test api 
app.get('/', (req, res) => {
    res.send('Sarahah App is running!');
});

app.use(
    (req, res, next) => {
        throw new NotFoundException('This router is not found' , { path: req.path })
    }
);

// Global error handler
app.use(globalErrorHandler);

// Server start
app.listen(port, () => {
    console.log(`Server is running on port `, port);
});
