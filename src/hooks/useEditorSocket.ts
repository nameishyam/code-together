// hooks/useEditorSocket.ts

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  RemoteCursor,
  EditorCodeChangePayload,
  CursorMovePayload,
  CursorJoinPayload,
  CursorDisconnectPayload,
  EditorInstance,
} from "@/types/editor.types";
import { getSocketUrl } from "@/utils/editor.utils";

type UseEditorSocketProps = {
  roomId?: string;
  clientId: string;
  color: string;
  editorRef: React.RefObject<EditorInstance | null>;
  isRemoteUpdateRef: React.MutableRefObject<boolean>;
};

export const useEditorSocket = ({
  roomId,
  clientId,
  color,
  editorRef,
  isRemoteUpdateRef,
}: UseEditorSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, RemoteCursor>
  >({});

  useEffect(() => {
    if (!roomId) return;

    let isActive = true;
    const roomName = `dashboard:${roomId}:editor`;
    setRemoteCursors({});

    const setupSocket = async () => {
      if (!isActive) return;

      const socketUrl = getSocketUrl();
      const socket = io(socketUrl, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join", {
          room: roomName,
          clientId,
          color,
        });
      });

      socket.on("editor_code_change", (payload: EditorCodeChangePayload) => {
        if (!payload || payload.clientId === clientId) return;
        const editor = editorRef.current;
        if (editor) {
          const model = editor.getModel();
          if (model && editor.getValue() !== payload.code) {
            isRemoteUpdateRef.current = true;
            const pos = editor.getPosition();
            model.pushEditOperations(
              [],
              [{ range: model.getFullModelRange(), text: payload.code }],
              () => null
            );
            if (pos) editor.setPosition(pos);
          }
        }
      });

      socket.on("editor_cursor_move", (p: CursorMovePayload) => {
        if (!p?.clientId) return;
        setRemoteCursors((prev) => ({
          ...prev,
          [p.clientId]: {
            x: p.x,
            y: p.y,
            color: p.color ?? "#666",
            lastSeen: Date.now(),
          },
        }));
      });

      socket.on("cursor_join", (p: CursorJoinPayload) => {
        if (!p?.clientId) return;
        setRemoteCursors((prev) => ({
          ...prev,
          [p.clientId]: {
            x: 0,
            y: 0,
            color: p.color ?? "#666",
            lastSeen: Date.now(),
          },
        }));
      });

      socket.on(
        "cursor_disconnect",
        ({ clientId }: CursorDisconnectPayload) => {
          setRemoteCursors((prev) => {
            const copy = { ...prev };
            delete copy[clientId];
            return copy;
          });
        }
      );
    };

    setupSocket();

    return () => {
      isActive = false;
      const socket = socketRef.current;
      if (socket) {
        try {
          socket.emit("leave", {
            room: roomName,
            clientId,
          });
        } catch {}
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [roomId, clientId, color, editorRef, isRemoteUpdateRef]);

  // Clean up stale cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 7000;
      setRemoteCursors((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((k) => {
          if (copy[k].lastSeen < cutoff) delete copy[k];
        });
        return copy;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { socketRef, remoteCursors };
};
