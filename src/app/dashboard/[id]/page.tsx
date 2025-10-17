"use client";

import MonacoEditor from "@/components/editor/MonacoEditor";
import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import languageBoilerplates from "@/utils/langBoilerPlates";

export default function DashboardPage() {
  const [code, setCode] = useState<string>(`#include <stdio.h>
    
int main() {
    printf("Hello, World!\\n");
    return 0;
}`);
  const [language, setLanguage] = useState<
    | "javascript"
    | "typescript"
    | "html"
    | "css"
    | "python"
    | "java"
    | "c"
    | "cpp"
  >("c");
  const [fontSize, setFontSize] = useState<number>(16);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const getLanguageId = useCallback((lang: string) => {
    switch (lang) {
      case "python":
        return 71;
      case "javascript":
        return 63;
      case "typescript":
        return 74;
      case "c":
        return 50;
      case "cpp":
        return 54;
      case "java":
        return 62;
      default:
        return 71;
    }
  }, []);

  const runCode = useCallback(async () => {
    setLoading(true);
    setOutput("");
    const body = {
      source_code: code,
      language_id: getLanguageId(language),
      wait: true,
      base64_encoded: false,
    };
    try {
      const res = await fetch("/api/judge0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      setOutput(
        result.stdout || result.stderr || result.compile_output || "No output"
      );
    } catch {
      setOutput("Error running code");
    }
    setLoading(false);
  }, [code, language, getLanguageId]);

  const handleSave = useCallback(() => {
    try {
      window.localStorage.setItem(`monaco:content:${language}`, code ?? "");
      window.localStorage.setItem(
        `monaco:content:${language}:ts`,
        new Date().toISOString()
      );
    } catch {}
  }, [code, language]);

  const handleReset = useCallback(() => {
    setCode("print('hello world')");
    try {
      window.localStorage.removeItem(`monaco:content:${language}`);
      window.localStorage.removeItem(`monaco:content:${language}:ts`);
    } catch {}
  }, [language]);

  const handleLanguageChange = useCallback((lang: typeof language) => {
    if (!lang) return;
    setLanguage(lang);
    const defaultCode = languageBoilerplates[lang] || "";
    setCode(defaultCode);
  }, []);

  // const handleCodeChange = useCallback((newCode: string) => {
  //   setCode(newCode);
  // }, []);

  // const handleFontSizeChange = useCallback((size: number) => {
  //   setFontSize(size);
  // }, []);

  const params = useParams<{ id: string }>();
  const idParam = params?.id;
  const roomId = Array.isArray(idParam) ? idParam[0] : idParam;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard {roomId ?? ""}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="flex h-[70vh] flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-medium">Editor</div>
              <div className="flex items-center gap-3">
                <Button onClick={runCode} disabled={loading}>
                  {loading ? "Running..." : "Run Code"}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <MonacoEditor
                roomId={roomId}
                value={code}
                onChange={setCode}
                language={language}
                onLanguageChange={handleLanguageChange}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                onSave={handleSave}
                onReset={handleReset}
                className="h-full"
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4 h-[60vh] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Output</div>
              <div className="text-sm text-muted-foreground">
                Language: {language}
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[--card-bg] rounded px-3 py-2 border">
              <pre className="whitespace-pre-wrap text-sm">
                {loading ? "Running..." : output}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
