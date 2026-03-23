import crypto from "node:crypto";

const SESSION_TOKEN_BYTES = 32;
const PASSWORD_KEY_LENGTH = 64;

export function normalizeUsername(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash = "") {
  const [salt, expectedHash] = String(storedHash || "").split(":");
  if (!salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (actualHash.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualHash, expectedBuffer);
}

export function createSessionToken() {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString("hex");
}
