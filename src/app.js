import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

// middlewares globaux
app.use(cors());
app.use(express.json());

// routes
app.use("/", routes);

export default app;