// utils/editor.utils.ts

import { v4 as uuidv4 } from "uuid";
import type { User } from "@/types/editor.types";

export const generateClientId = (
  isLoggedIn: boolean,
  user: User | null
): string => {
  try {
    if (isLoggedIn && user) {
      localStorage.setItem("mc:clientId", user.uname);
      return user.uname;
    }
    return uuidv4();
  } catch {
    return uuidv4();
  }
};

export const generateRandomColor = (): string => {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h} 80% 50%)`;
};

export const clampValue = (value: number): number => {
  return Number.isNaN(value) ? 0 : Math.max(0, Math.min(1, value));
};

export const getSocketUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    window.location.origin.replace(/^http/, "http")
  );
};
