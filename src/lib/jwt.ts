import jwt from "jsonwebtoken";

const JWT_SECRET: string =
  process.env.JWT_SECRET || "your-secret-key-for-development";

export function signToken(
  payload: string | object | Buffer,
  expiresIn: string | number = "1h"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err: unknown) {
    if (err instanceof jwt.JsonWebTokenError) {
      console.error("JWT error:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
    return null;
  }
}
