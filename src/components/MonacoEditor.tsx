import React, { useRef } from "react";
import dynamic from "next/dynamic";

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
}: MonacoEditorProps) {
  const editorRef = useRef<unknown | null>(null);

  function handleEditorMount(editor: unknown, monaco: unknown) {
    editorRef.current = editor as unknown;
    try {
      const m = monaco as unknown as {
        editor?: { setTheme?: (theme: string) => void };
      };
      if (m && m.editor && typeof m.editor.setTheme === "function") {
        m.editor.setTheme("vs-dark");
      }
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Language</span>
            <Select
              value={language}
              onValueChange={(val: string) =>
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

      <div className="border" style={{ height: "60vh" }}>
        <Editor
          height="100%"
          language={language}
          value={value}
          onMount={handleEditorMount}
          onChange={(v) => onChange(v ?? "")}
          options={{ automaticLayout: true, fontSize }}
          theme="vs-dark"
        />
      </div>
    </div>
  );
}
