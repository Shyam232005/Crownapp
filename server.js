import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 1. CA requests data access
    socket.on("ca-request-data", (data) => {
      console.log(`CA requested data for month: ${data.month}`);
      // Broadcast to the Owner's dashboard
      socket.broadcast.emit("owner-receive-request", data);
    });

    // 2. Owner approves data access
    socket.on("owner-approve-data", (data) => {
      console.log(`Owner approved data for month: ${data.month}`);
      // Broadcast back to the CA's dashboard
      socket.broadcast.emit("ca-data-unlocked", data);
    });

    // 3. Employee Live Attendance
    socket.on("new-submission", (data) => {
      // Broadcast live punches to the Owner's dashboard
      socket.broadcast.emit("live-attendance-update", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});