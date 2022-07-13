import express from 'express';
import { start } from './server/server';
import { connectDB } from "./database/database";
import { json, urlencoded } from 'body-parser';

// Manage HTTP requests
import { errorHelper } from './handlers/ErrorHandler';
import { httpHeaders } from './config/httpHeaders';

// routes
import userRouter from './routes/userRouter';
import authRouter from './routes/authRouter';
import movieRouter from './routes/movieRouter';
import theMovideDBRouter from './routes/theMovideDBRouter';

// Create server
const server = express();

// connect DB
connectDB();

// HTTP requests setup
server.use(json());
server.use(urlencoded({ extended: false }));
server.use(httpHeaders);

// Routes
server.use('/api/auth/', authRouter);
server.use('/api/movies/', movieRouter);
server.use('/api/users/', userRouter);
server.use('/api/the-movie-db/', theMovideDBRouter);

server.use(errorHelper);

// Connect to db and run server
start(server);
