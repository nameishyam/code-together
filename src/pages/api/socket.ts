import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer, type Socket as IOSocket } from "socket.io";

type SocketServerWithIO = HTTPServer & {
  io?: IOServer;
};

type NetSocketWithIO = NetSocket & {
  server: SocketServerWithIO;
};

type NextApiResponseServerIO = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: SocketServerWithIO;
  };
};

const registerHandlers = (io: IOServer) => {
  io.on("connection", (socket: IOSocket) => {
    console.log("socket connected", socket.id);

    socket.on(
      "join",
      ({
        room,
        clientId,
        color,
        name,
      }: {
        room: string;
        clientId: string;
        color?: string;
        name?: string;
      }) => {
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
      }
    );

    socket.on(
      "editor_cursor_move",
      (payload: {
        room?: string;
        clientId?: string;
        x?: number;
        y?: number;
        ts?: number;
        color?: string;
      }) => {
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
      }
    );

    socket.on(
      "leave",
      ({ room, clientId }: { room?: string; clientId?: string }) => {
        if (!room || !clientId) return;
        socket.leave(room);
        socket.to(room).emit("cursor_disconnect", { clientId });
      }
    );

    socket.on("disconnect", () => {
      const { room, clientId } = (socket.data || {}) as {
        room?: string;
        clientId?: string;
      };
      if (room && clientId) {
        socket.to(room).emit("cursor_disconnect", { clientId });
      }
    });

    socket.on(
      "editor_code_change",
      (payload: { room: string; clientId: string; code: string }) => {
        const { room, clientId, code } = payload;
        if (!room || !clientId) return;
        socket.to(room).emit("editor_code_change", { clientId, code });
      }
    );
  });
};

export default function socketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket) {
    res.status(500).end();
    return;
  }

  const netSocket = res.socket as unknown as NetSocketWithIO;

  if (!netSocket.server.io) {
    const io = new IOServer(netSocket.server, {
      path: "/socket.io",
    });
    registerHandlers(io);
    netSocket.server.io = io;
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
