"use client";

import React from "react";
import type { RemoteCursor } from "@/types/editor.types";

type RemoteCursorsProps = {
  cursors: Record<string, RemoteCursor>;
};

export const RemoteCursors = ({ cursors }: RemoteCursorsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(cursors).map(([id, cur]) => {
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
  );
};
