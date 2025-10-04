import { NextResponse } from "next/server";

export async function GET() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return NextResponse.json({ sessionCode: code });
}
