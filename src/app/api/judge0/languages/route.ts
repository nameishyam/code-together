import { NextResponse } from "next/server";

type Judge0Language = {
  id: number;
  name: string;
  extension: string;
};

const SUPPORTED_LANGUAGES: Judge0Language[] = [
  {
    id: 50,
    name: "C (GCC 9.2.0)",
    extension: "c",
  },
  {
    id: 54,
    name: "C++ (GCC 9.2.0)",
    extension: "cpp",
  },
  {
    id: 62,
    name: "Java (OpenJDK 13.0.1)",
    extension: "java",
  },
  {
    id: 71,
    name: "Python (3.8.1)",
    extension: "py",
  },
];

export async function GET() {
  try {
    return NextResponse.json(SUPPORTED_LANGUAGES, { status: 200 });
  } catch (err: unknown) {
    console.error("Error returning languages", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
