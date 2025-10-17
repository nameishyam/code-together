import type { editor } from "monaco-editor";

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "html"
  | "css"
  | "python"
  | "java"
  | "c"
  | "cpp";

export type MonacoEditorProps = {
  initialLanguage?: SupportedLanguage;
  initialValue?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSave?: () => void;
  onReset?: () => void;
  roomId?: string;
};

export type RemoteCursor = {
  x: number;
  y: number;
  color: string | null;
  lastSeen: number;
};

export type EditorCodeChangePayload = {
  clientId: string;
  code: string;
};

export type CursorMovePayload = {
  clientId: string;
  x: number;
  y: number;
  color: string | null;
};

export type CursorJoinPayload = {
  clientId: string;
  color: string | null;
};

export type CursorDisconnectPayload = {
  clientId: string;
};

export type User = {
  uname: string;
  email: string;
};

export type EditorInstance = editor.IStandaloneCodeEditor;
