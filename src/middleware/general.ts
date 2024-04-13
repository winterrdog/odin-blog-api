import { Express } from "express";
import { rateLimit } from "express-rate-limit";
import * as cors from "cors";
import helmet from "helmet";

const express = require("express");
export default function applyGeneralMiddleware(app: Express) {
  app.use(express.json()); // parse application/json
  app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
  app.use(cors()); // allow cross-origin requests
  app.use(helmet()); // set security headers
  app.use(
    rateLimit({
      windowMs: 20 * 60 * 1000, // 20 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message:
        "Too many requests from this IP, please try again after 20 minutes",
      statusCode: 429,
    })
  ); // limit repeated requests to avoid abuse of the API
}
