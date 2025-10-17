"use client";

import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SupportedLanguage } from "@/types/editor.types";

type EditorToolbarProps = {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSave?: () => void;
  onReset?: () => void;
};

export const EditorToolbar = memo(function EditorToolbar({
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  onSave,
  onReset,
}: EditorToolbarProps) {
  const handleLanguageChange = useCallback(
    (value: string) => {
      onLanguageChange(value as SupportedLanguage);
    },
    [onLanguageChange]
  );

  const handleFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFontSizeChange(Number(e.target.value) || 16);
    },
    [onFontSizeChange]
  );

  return (
    <div className="mb-3 flex flex-none items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">Language</span>
          <Select value={language} onValueChange={handleLanguageChange}>
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
            onChange={handleFontSizeChange}
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
  );
});
