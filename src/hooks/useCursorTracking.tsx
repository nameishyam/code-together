import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { clampValue } from "@/utils/editor.utils";

type UseCursorTrackingProps = {
  roomId?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  socketRef: React.RefObject<Socket | null>;
  clientId: string;
  color: string;
};

export const useCursorTracking = ({
  roomId,
  containerRef,
  socketRef,
  clientId,
  color,
}: UseCursorTrackingProps) => {
  const lastPosRef = useRef<{ x: number; y: number; ts: number } | null>(null);
  const lastEmitRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = clampValue((e.clientX - rect.left) / (rect.width || 1));
      const y = clampValue((e.clientY - rect.top) / (rect.height || 1));
      lastPosRef.current = { x, y, ts: Date.now() };
    };

    el.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const now = Date.now();
      if (!lastPosRef.current) return;
      if (now - lastEmitRef.current >= 50) {
        const s = socketRef.current;
        if (s && s.connected) {
          s.emit("editor_cursor_move", {
            room: `dashboard:${roomId}:editor`,
            clientId,
            x: lastPosRef.current.x,
            y: lastPosRef.current.y,
            ts: lastPosRef.current.ts,
            color,
          });
          lastEmitRef.current = now;
        }
      }
    };
    loop();

    return () => {
      el.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [roomId, containerRef, socketRef, clientId, color]);
};
