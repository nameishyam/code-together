import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(
  ","
);

const app = express();
app.get("/", (req, res) => res.send("Socket.IO server running"));

app.get("/wake", (req, res) => {
  res.status(200).send("OK");
});

const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const registerHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    socket.on("join", ({ room, clientId, color, name }) => {
      if (!room || !clientId) return;
      socket.join(room);
      socket.data = socket.data || {};
      socket.data.room = room;
      socket.data.clientId = clientId;
      socket.to(room).emit("cursor_join", {
        clientId,
        color: color ?? null,
        name: name ?? null,
      });
    });

    socket.on("editor_cursor_move", (payload) => {
      if (
        !payload ||
        typeof payload.x !== "number" ||
        typeof payload.y !== "number"
      )
        return;
      const { room, clientId, color } = payload;
      if (!room || !clientId) return;
      const x = Math.max(0, Math.min(1, payload.x));
      const y = Math.max(0, Math.min(1, payload.y));
      socket.to(room).emit("editor_cursor_move", {
        clientId,
        x,
        y,
        ts: typeof payload.ts === "number" ? payload.ts : Date.now(),
        color: color ?? null,
      });
    });

    socket.on("editor_code_change", (payload) => {
      const { room, clientId, code } = payload || {};
      if (!room || !clientId || typeof code !== "string") return;
      socket.to(room).emit("editor_code_change", { clientId, code });
    });

    socket.on("leave", ({ room, clientId }) => {
      if (!room || !clientId) return;
      socket.leave(room);
      socket.to(room).emit("cursor_disconnect", { clientId });
    });

    socket.on("disconnect", () => {
      const { room, clientId } = socket.data || {};
      if (room && clientId)
        socket.to(room).emit("cursor_disconnect", { clientId });
    });
  });
};

registerHandlers(io);

server.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});
