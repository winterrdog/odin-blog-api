/**
 * Module dependencies.
 */

import mongoose from "mongoose";
import app from "../app";
import * as http from "node:http";
import * as debugMod from "debug";
require("dotenv").config(); // env variables

const debug = debugMod("blog:server");

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
    debug("server started on port: " + port);

    conn = await connectToDb();
    if (!conn) throw new Error("database didn't connect successfully");

    server.on("error", onError);
    server.on("listening", onListening);
  } catch (e) {
    debug("server crashed: ", e);
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
    debug("mongodb ran into an error during close: ", e);
  });
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      debug(bind + " requires elevated privileges");
      return;
    case "EADDRINUSE":
      debug(bind + " is already in use");
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
  debug("Listening on " + bind);
}

/**
 * Start the database connection
 */
async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    debug("database server was connected to successfully!");
    return mongoose.connection;
  } catch (e) {
    debug("Error occurred when connceting to database: ", e);
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
      debug("application disconnecting from mongodb...");
    });
    await conn.close();
  } catch (e) {
    debug("error occurred after connecting to db: ", e);
  }
}
