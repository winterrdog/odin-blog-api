import express from "express";
import logger from "morgan";
import indexRouter from "./routes/index";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// todo: add rate limiter
// todo: add cors
// todo: add helmet

app.use("/api", indexRouter);

export default app;
