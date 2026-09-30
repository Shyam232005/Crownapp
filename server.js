import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 User Connected:", socket.id);

    // 1. Employee to Owner (New Submission)
    socket.on("new-submission", (data) => {
      socket.broadcast.emit("owner-notification", data);
    });

    // 2. Owner to Employee (Status Update) - NAYA CODE 🔥
    socket.on("status-update", (data) => {
      // Owner ne approve/reject kiya, ab employee ko batao
      socket.broadcast.emit("submission-updated", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User Disconnected:", socket.id);
    });

    // CA asks for data
    socket.on("ca-request-data", (requestInfo) => {
      console.log("CA is requesting data:", requestInfo);
      socket.broadcast.emit("owner-ca-alert", requestInfo);
    });

    // Owner approves CA request
    socket.on("owner-approve-data", (approvalInfo) => {
      console.log("Owner approved data for CA:", approvalInfo);
      socket.broadcast.emit("ca-data-unlocked", approvalInfo);
    });
  });

  httpServer.once("error", (err) => {
    console.error("Server Error:", err);
    process.exit(1);
  }).listen(port, () => {
    console.log(`> FineOps Real-Time Server running on http://${hostname}:${port}`);
  });
});