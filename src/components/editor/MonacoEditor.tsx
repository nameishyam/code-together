"use client";

import React, { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import { getUser } from "@/lib/auth";
import { generateClientId, generateRandomColor } from "@/utils/editor.utils";
import { useEditorSocket } from "@/hooks/useEditorSocket";
import { useCursorTracking } from "@/hooks/useCursorTracking";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { RemoteCursors } from "@/components/editor/RemoteCursors";
import type { MonacoEditorProps, User } from "@/types/editor.types";
import { cn } from "@/utils/utils";
import { useAuth } from "@/hooks/client-wrapper";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
  const isRemoteUpdateRef = useRef(false);
  const { isLoggedIn } = useAuth();
  const user = getUser();

  const [clientId] = useState<string>(() =>
    generateClientId(isLoggedIn, user as User | null)
  );
  const [color] = useState<string>(() => generateRandomColor());

  const { socketRef, remoteCursors } = useEditorSocket({
    roomId,
    clientId,
    color,
    editorRef,
    isRemoteUpdateRef,
  });

  useCursorTracking({
    roomId,
    containerRef,
    socketRef,
    clientId,
    color,
  });

  const handleEditorMount = useCallback(
    (
      editor: editor.IStandaloneCodeEditor,
      monaco: typeof import("monaco-editor")
    ) => {
      editorRef.current = editor;
      try {
        if (monaco?.editor?.setTheme) {
          monaco.editor.setTheme("vs-dark");
        }
      } catch (error) {
        console.error("Error setting theme:", error);
      }
    },
    []
  );

  const handleChange = useCallback(
    (v: string | undefined) => {
      if (!v) return;
      onChange(v);

      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }

      if (!roomId || !socketRef.current?.connected) return;

      socketRef.current.emit("editor_code_change", {
        room: `dashboard:${roomId}:editor`,
        clientId,
        code: v,
      });
    },
    [onChange, roomId, clientId, socketRef]
  );

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <EditorToolbar
        language={language}
        onLanguageChange={onLanguageChange}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        onSave={onSave}
        onReset={onReset}
      />

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

        <RemoteCursors cursors={remoteCursors} />
      </div>
    </div>
  );
}
