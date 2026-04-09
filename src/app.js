import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import path from "path";


dotenv.config();

const app = express();
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// middlewares globaux
app.use(cors());
app.use(express.json());

// routes
app.use('/api', routes)

export default app;