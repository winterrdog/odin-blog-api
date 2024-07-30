/**
 * Module dependencies.
 */

import * as http from "node:http";
import mongoose from "mongoose";
import app from "../app";
require("dotenv").config(); // env variables
import { startLogger } from "../logging";

// setting up logging for this module
const logger = startLogger(__filename);
logger.info("starting application server...");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT! || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
let conn: mongoose.Connection | null = null;

/**
 * Listen on provided port, on all network interfaces.
 */
const main = async function () {
  try {
    server.listen(port);
    logger.info("server started on port: " + port);

    conn = await connectToDb();
    if (!conn) {
      throw new Error("database didn't connect successfully");
    }

    server.on("error", onError);
    server.on("listening", onListening);
    process.on("uncaughtException", handleUncaughtExceptions);
  } catch (e) {
    logger.error(e, "server crashed during startup...");

    if (conn) {
      await closeDb(conn);
    }

    process.exit(1);
  }
};
main();

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  // named pipe
  if (isNaN(port)) return val;

  // port number
  if (port >= 0) return port;

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== "listen") throw error;
  if (!conn) {
    throw new Error("database didn't connect successfully");
  }

  closeDb(conn).catch((e) => {
    logger.error(e, "mongodb ran into an error during close...");
  });

  let bind: string;
  if (typeof port === "string") {
    bind = "Pipe " + port;
  } else {
    bind = "Port " + port;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error(bind + " requires elevated privileges");
      return;
    case "EADDRINUSE":
      logger.error(bind + " is already in use");
      return;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  if (!addr) {
    throw new Error("server address wasn't set correctly");
  }

  let bind: string;
  if (typeof addr === "string") {
    bind = "pipe " + addr;
  } else {
    bind = "port " + addr.port;
  }

  logger.info("server listening on " + bind);
}

async function connectToDb() {
  try {
    await mongoose.connect(
      process.env.NODE_ENV === "production"
        ? process.env.MONGO_URI!
        : process.env.DEV_MONGO_URI!
    );
    logger.info("database connected successfully...");
    return mongoose.connection;
  } catch (e) {
    logger.error(e, "database connection failed...");
    throw e;
  }
}

async function closeDb(conn: mongoose.Connection) {
  try {
    conn.on("disconnecting", () => {
      logger.info("application disconnecting from mongodb...");
    });
    await conn.close();
  } catch (e) {
    logger.error(e, "error occurred after connecting to db...");
  }
}

async function handleUncaughtExceptions(
  err: Error,
  origin: NodeJS.UncaughtExceptionOrigin
) {
  logger.error(
    err,
    origin === "unhandledRejection"
      ? "an unhandled rejection occurred"
      : "an uncaught exception occurred"
  );

  // close the database connection gracefully
  await closeDb(conn!);

  const forceAnExit = () => {
    logger.fatal(
      "server didn't close in time so forcing the process to exit..."
    );
    process.abort();
  };

  const gracefulExit = (e: Error | undefined): never => {
    if (e) {
      logger.error(e, "server didn't close gracefully...");
      forceAnExit();
    }

    logger.info("server closed gracefully...");
    process.exit(0);
  };

  server.close(gracefulExit); // close the server gracefully
  setTimeout(forceAnExit, 3000); // force the server to close after 3 seconds

  // exit the process
  process.exit(1);
}
