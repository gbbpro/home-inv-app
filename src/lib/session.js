// Login sessions: a signed token in an HttpOnly cookie.
// Uses `jose` so the same code runs in middleware (edge) and API routes.
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "token";
const MAX_AGE = 60 * 60 * 24 * 30; // stay logged in for 30 days

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not set");
    }
    return new TextEncoder().encode("dev-only-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(username) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function readToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.username === "string" ? payload : null;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`;
}

export const clearedCookie = `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
