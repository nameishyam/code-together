import { NextRequest, NextResponse } from "next/server";

type SubmitBody = Record<string, unknown>;

const BASE = process.env.NEXT_JUDGE0_BASE_URL;
const API_KEY = process.env.NEXT_JUDGE0_API_KEY ?? null;
const RAPIDAPI_KEY = process.env.NEXT_JUDGE0_RAPID_API_KEY ?? null;
const RAPIDAPI_HOST = process.env.NEXT_JUDGE0_RAPID_API_HOST ?? null;

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["X-Auth-Token"] = API_KEY;
  if (RAPIDAPI_KEY && RAPIDAPI_HOST) {
    headers["x-rapidapi-key"] = RAPIDAPI_KEY;
    headers["x-rapidapi-host"] = RAPIDAPI_HOST;
  }
  return headers;
}

function validateSubmitPayload(body: SubmitBody | null): string | null {
  if (!body) return "Missing request body";
  const hasSource =
    typeof body.source_code === "string" ||
    typeof body.encoded_source === "string";
  if (!hasSource) return "Missing source_code or encoded_source";
  const lang = body.language_id;
  if (lang === undefined || lang === null) return "Missing language_id";
  if (
    !(
      typeof lang === "number" ||
      (typeof lang === "string" && /^[0-9]+$/.test(lang))
    )
  ) {
    return "language_id must be a number or numeric string";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { error: "Server misconfigured: NEXT_JUDGE0_BASE_URL not set" },
        { status: 500 }
      );
    }
    const body = (await req.json()) as SubmitBody | null;
    const validationError = validateSubmitPayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    const wait = body?.wait === undefined ? false : Boolean(body?.wait);
    const base64 =
      body?.base64_encoded === undefined
        ? false
        : Boolean(body?.base64_encoded);
    const qs = new URLSearchParams({
      base64_encoded: String(base64),
      wait: String(wait),
    }).toString();
    const url = `${BASE.replace(/\/+$/, "")}/submissions?${qs}`;
    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Judge0 proxy POST error", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { error: "Server misconfigured: NEXT_JUDGE0_BASE_URL not set" },
        { status: 500 }
      );
    }
    const urlObj = new URL(req.url);
    const token = urlObj.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Missing token query param" },
        { status: 400 }
      );
    }
    const base64 = urlObj.searchParams.get("base64_encoded") || "false";
    const url = `${BASE.replace(/\/+$/, "")}/submissions/${encodeURIComponent(
      token
    )}?base64_encoded=${encodeURIComponent(base64)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Judge0 proxy GET error", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
