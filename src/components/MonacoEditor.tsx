"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export type MonacoEditorProps = {
  initialLanguage?:
    | "javascript"
    | "typescript"
    | "html"
    | "css"
    | "python"
    | "java"
    | "c"
    | "cpp";
  initialValue?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  language: MonacoEditorProps["initialLanguage"];
  onLanguageChange: (lang: MonacoEditorProps["initialLanguage"]) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSave?: () => void;
  onReset?: () => void;
  roomId?: string;
};

type RemoteCursor = {
  x: number;
  y: number;
  color: string | null;
  lastSeen: number;
};

type EditorCodeChangePayload = {
  clientId: string;
  code: string;
};

type CursorMovePayload = {
  clientId: string;
  x: number;
  y: number;
  color: string | null;
};

type CursorJoinPayload = {
  clientId: string;
  color: string | null;
};

type CursorDisconnectPayload = {
  clientId: string;
};

export default function MonacoEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  onSave,
  onReset,
  className,
  roomId,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const colorRef = useRef<string | null>(null);
  const isRemoteUpdateRef = useRef(false); // Prevent infinite loops
  const lastEmitRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, RemoteCursor>
  >({});

  useEffect(() => {
    try {
      let saved = localStorage.getItem("mc:clientId");
      if (!saved) {
        saved = uuidv4();
        localStorage.setItem("mc:clientId", saved);
      }
      clientIdRef.current = saved;
    } catch {
      clientIdRef.current = uuidv4();
    }
    const h = Math.floor(Math.random() * 360);
    colorRef.current = `hsl(${h} 80% 50%)`;
  }, []);

  const handleEditorMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ) => {
    editorRef.current = editor;
    try {
      if (monaco?.editor?.setTheme) monaco.editor.setTheme("vs-dark");
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  };

  const handleChange = (v: string | undefined) => {
    if (!v) return;
    onChange(v);

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    if (!roomId || !socketRef.current?.connected) return;

    socketRef.current.emit("editor_code_change", {
      room: `dashboard:${roomId}:editor`,
      clientId: clientIdRef.current,
      code: v,
    });
  };

  useEffect(() => {
    if (!roomId) return;
    let isActive = true;
    const roomName = `dashboard:${roomId}:editor`;
    setRemoteCursors({});

    const setupSocket = async () => {
      if (!isActive) return;

      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        window.location.origin.replace(/^http/, "http");
      const socket = io(socketUrl, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join", {
          room: roomName,
          clientId: clientIdRef.current,
          color: colorRef.current,
        });
      });

      socket.on("editor_code_change", (payload: EditorCodeChangePayload) => {
        if (!payload || payload.clientId === clientIdRef.current) return;
        const editor = editorRef.current;
        if (editor) {
          isRemoteUpdateRef.current = true;
          const model = editor.getModel();
          if (model) {
            const position = editor.getPosition();
            if (editor.getValue() !== payload.code) {
              isRemoteUpdateRef.current = true;
              const model = editor.getModel();
              if (model) {
                const pos = editor.getPosition();
                model.pushEditOperations(
                  [],
                  [{ range: model.getFullModelRange(), text: payload.code }],
                  () => null
                );
                if (pos) editor.setPosition(pos);
              }
            }
            if (position) editor.setPosition(position);
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
            clientId: clientIdRef.current,
          });
        } catch {}
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [roomId]);

  const lastPosRef = useRef<{ x: number; y: number; ts: number } | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const el = containerRef.current;
    if (!el) return;

    const clamp = (v: number) =>
      Number.isNaN(v) ? 0 : Math.max(0, Math.min(1, v));
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = clamp((e.clientX - rect.left) / (rect.width || 1));
      const y = clamp((e.clientY - rect.top) / (rect.height || 1));
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
            clientId: clientIdRef.current,
            x: lastPosRef.current.x,
            y: lastPosRef.current.y,
            ts: lastPosRef.current.ts,
            color: colorRef.current,
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
  }, [roomId]);

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

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="mb-3 flex flex-none items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Language</span>
            <Select
              value={language}
              onValueChange={(val) =>
                onLanguageChange(val as MonacoEditorProps["initialLanguage"])
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Font</span>
            <Input
              type="number"
              value={String(fontSize)}
              onChange={(e) => onFontSizeChange(Number(e.target.value) || 16)}
              className="w-20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onSave} type="button" className="h-9">
            Save
          </Button>
          <Button
            onClick={onReset}
            type="button"
            variant="outline"
            className="h-9"
          >
            Reset
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden border"
        style={{ position: "relative" }}
      >
        <Editor
          height="100%"
          language={language}
          value={value}
          onMount={handleEditorMount}
          onChange={handleChange}
          options={{ automaticLayout: true, fontSize }}
          theme="vs-dark"
        />

        <div className="absolute inset-0 pointer-events-none">
          {Object.entries(remoteCursors).map(([id, cur]) => {
            const label = id.slice(0, 4);
            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  left: `${cur.x * 100}%`,
                  top: `${cur.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  zIndex: 60,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background: cur.color ?? "#666",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    background: "rgba(0,0,0,0.65)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 6,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
