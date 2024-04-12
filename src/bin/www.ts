/**
 * Module dependencies.
 */

import mongoose from "mongoose";
import app from "../app";
import * as http from "node:http";
require("dotenv").config(); // env variables
import { logger } from "../logging";

// setting up logging for this module
const serverLogger = logger.child({ module: "www" });
serverLogger.info("starting server...");

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
(async function () {
  try {
    server.listen(port);
    serverLogger.info("server started on port: " + port);
    conn = await connectToDb();
    if (!conn) throw new Error("database didn't connect successfully");
    server.on("error", onError);
    server.on("listening", onListening);
    process.on("uncaughtException", handleUncaughtExceptions);
  } catch (e) {
    serverLogger.error(e, "server crashed during startup...");
    if (conn) await closeDb(conn);
    process.exit(1);
  }
})();

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
  if (!conn) throw new Error("database didn't connect successfully");

  closeDb(conn).catch((e) => {
    serverLogger.error(e, "mongodb ran into an error during close...");
  });
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      serverLogger.error(bind + " requires elevated privileges");
      return;
    case "EADDRINUSE":
      serverLogger.error(bind + " is already in use");
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
  if (!addr) throw new Error("server address wasn't set correctly");
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  serverLogger.info("server listening on " + bind);
}

/**
 * Start the database connection
 */
async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    serverLogger.info("database connected successfully...");
    return mongoose.connection;
  } catch (e) {
    serverLogger.error(e, "database connection failed...");
    throw e;
  }
}

/**
 * Closes the database connection.
 * @param conn mongoose.Connection
 * @returns void
 */
async function closeDb(conn: mongoose.Connection) {
  try {
    conn.on("disconnecting", () => {
      serverLogger.info("application disconnecting from mongodb...");
    });
    await conn.close();
  } catch (e) {
    serverLogger.error(e, "error occurred after connecting to db...");
  }
}

async function handleUncaughtExceptions(
  err: Error,
  origin: NodeJS.UncaughtExceptionOrigin
) {
  serverLogger.error(
    err,
    origin === "unhandledRejection"
      ? "an unhandled rejection occurred"
      : "an uncaught exception occurred"
  );

  // close the database connection gracefully
  await closeDb(conn!);

  const forceAnExit = () => {
    serverLogger.fatal(
      "server didn't close in time so forcing the process to exit..."
    );
    process.abort();
  };
  const gracefulExit = (e: Error | undefined): never => {
    if (e) {
      serverLogger.error(e, "server didn't close gracefully...");
      forceAnExit();
    }
    serverLogger.info("server closed gracefully...");
    process.exit(0);
  };

  server.close(gracefulExit); // close the server gracefully
  setTimeout(forceAnExit, 3000); // force the server to close after 3 seconds

  // exit the process
  process.exit(1);
}
