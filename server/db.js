import { Pool } from "pg";
import { createBlankCv, createSeedCv } from "../src/utils/cvData.js";
import { createSessionToken, hashPassword, normalizeUsername, verifyPassword } from "./security.js";

const connectionString = process.env.DATABASE_URL
  || "postgresql://cv_user:cv_password@db:5432/cv_builder";

export const pool = new Pool({
  connectionString,
});

function mapCvRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    document: row.document,
  };
}

function assertPassword(password = "") {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

async function createUserRecord(client, username, password) {
  const normalizedUsername = normalizeUsername(username);
  assertPassword(password);

  const result = await client.query(
    `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, created_at, updated_at
    `,
    [normalizedUsername, hashPassword(password)]
  );

  return result.rows[0];
}

async function createSessionRecord(client, userId) {
  const token = createSessionToken();
  await client.query(
    `
      INSERT INTO user_sessions (token, user_id, expires_at)
      VALUES ($1, $2::uuid, NOW() + INTERVAL '30 days')
    `,
    [token, userId]
  );
  return token;
}

export async function ensureSchema() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT NOT NULL UNIQUE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cvs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      document JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE cvs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
  `);

  await pool.query("CREATE INDEX IF NOT EXISTS cvs_updated_at_idx ON cvs (updated_at DESC)");
  await pool.query("CREATE INDEX IF NOT EXISTS cvs_user_updated_at_idx ON cvs (user_id, updated_at DESC)");
  await pool.query("CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions (user_id)");

  await ensureDefaultAccount();
}

export async function ensureDefaultAccount() {
  const seededUsername = normalizeUsername(process.env.SEED_USERNAME || "");
  const seededPassword = process.env.SEED_PASSWORD || "";

  if (!seededUsername || !seededPassword) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let user = await client.query(
      "SELECT id, username FROM users WHERE username = $1",
      [seededUsername]
    );

    if (!user.rows[0]) {
      user = await client.query(
        `
          INSERT INTO users (username, password_hash)
          VALUES ($1, $2)
          RETURNING id, username
        `,
        [seededUsername, hashPassword(seededPassword)]
      );
    }

    const userId = user.rows[0].id;

    const orphanResult = await client.query(
      "SELECT id FROM cvs WHERE user_id IS NULL ORDER BY updated_at DESC"
    );

    if (orphanResult.rows.length > 0) {
      await client.query(
        "UPDATE cvs SET user_id = $1::uuid, updated_at = NOW() WHERE user_id IS NULL",
        [userId]
      );
    }

    const ownedCvCount = await client.query(
      "SELECT COUNT(*)::int AS count FROM cvs WHERE user_id = $1::uuid",
      [userId]
    );

    if (!ownedCvCount.rows[0]?.count) {
      const seedCv = createSeedCv();
      await client.query(
        `
          INSERT INTO cvs (id, user_id, name, document)
          VALUES ($1::uuid, $2::uuid, $3, $4::jsonb)
        `,
        [seedCv.id, userId, seedCv.name, JSON.stringify(seedCv)]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function registerUser(username, password) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE username = $1",
      [normalizedUsername]
    );

    if (existing.rows[0]) {
      throw new Error("Username is already taken.");
    }

    const user = await createUserRecord(client, normalizedUsername, password);
    const token = await createSessionRecord(client, user.id);
    await client.query("COMMIT");

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser(username, password) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername || typeof password !== "string") {
    throw new Error("Invalid username or password.");
  }
  const result = await pool.query(
    "SELECT id, username, password_hash FROM users WHERE username = $1",
    [normalizedUsername]
  );
  const user = result.rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new Error("Invalid username or password.");
  }

  const token = await createSessionRecord(pool, user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

export async function getUserFromToken(token = "") {
  if (!token) return null;

  const result = await pool.query(
    `
      SELECT users.id, users.username
      FROM user_sessions
      INNER JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token = $1
        AND user_sessions.expires_at > NOW()
      LIMIT 1
    `,
    [token]
  );

  return result.rows[0] || null;
}

export async function deleteSession(token = "") {
  if (!token) return;
  await pool.query("DELETE FROM user_sessions WHERE token = $1", [token]);
}

export async function changeUserPassword(userId, currentPassword, nextPassword) {
  if (typeof currentPassword !== "string") {
    throw new Error("Current password is required.");
  }
  assertPassword(nextPassword);

  const result = await pool.query(
    "SELECT password_hash FROM users WHERE id = $1::uuid",
    [userId]
  );
  const user = result.rows[0];

  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    throw new Error("Current password is incorrect.");
  }

  await pool.query(
    "UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1::uuid",
    [userId, hashPassword(nextPassword)]
  );
}

export async function listUserCvs(userId) {
  const result = await pool.query(
    `
      SELECT id, name, created_at, updated_at
      FROM cvs
      WHERE user_id = $1::uuid
      ORDER BY updated_at DESC, created_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function deleteUserCvs(userId, cvIds = []) {
  const ids = Array.isArray(cvIds)
    ? [...new Set(cvIds.map((value) => String(value || "").trim()).filter(Boolean))]
    : [];

  if (ids.length === 0) {
    return [];
  }

  const result = await pool.query(
    `
      DELETE FROM cvs
      WHERE user_id = $1::uuid
        AND id = ANY($2::uuid[])
      RETURNING id
    `,
    [userId, ids]
  );

  return result.rows.map((row) => row.id);
}

export async function renameUserCv(userId, cvId, nextName = "") {
  const safeName = String(nextName || "").trim() || "Untitled CV";

  const result = await pool.query(
    `
      UPDATE cvs
      SET
        name = $3,
        document = jsonb_set(COALESCE(document, '{}'::jsonb), '{name}', to_jsonb($3::text), true),
        updated_at = NOW()
      WHERE user_id = $1::uuid
        AND id = $2::uuid
      RETURNING id, name, document, created_at, updated_at
    `,
    [userId, cvId, safeName]
  );

  return mapCvRow(result.rows[0]);
}

export async function getUserCvById(userId, cvId) {
  const result = await pool.query(
    `
      SELECT id, name, document, created_at, updated_at
      FROM cvs
      WHERE user_id = $1::uuid AND id = $2::uuid
      LIMIT 1
    `,
    [userId, cvId]
  );

  return mapCvRow(result.rows[0]);
}

export async function getLatestUserCv(userId) {
  const result = await pool.query(
    `
      SELECT id, name, document, created_at, updated_at
      FROM cvs
      WHERE user_id = $1::uuid
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return mapCvRow(result.rows[0]);
}

export async function saveUserCvDocument(userId, cv) {
  const existing = await pool.query(
    "SELECT user_id FROM cvs WHERE id = $1::uuid",
    [cv.id]
  );

  if (existing.rows[0] && existing.rows[0].user_id !== userId) {
    throw new Error("You are not allowed to modify this CV.");
  }

  const result = await pool.query(
    `
      INSERT INTO cvs (id, user_id, name, document)
      VALUES ($1::uuid, $2::uuid, $3, $4::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        document = EXCLUDED.document,
        updated_at = NOW()
      RETURNING id, name, document, created_at, updated_at
    `,
    [cv.id, userId, cv.name, JSON.stringify(cv)]
  );

  return mapCvRow(result.rows[0]);
}

export async function createUserCvDocument(userId, template = "blank") {
  const cv = template === "sample" ? createSeedCv() : createBlankCv();
  const saved = await saveUserCvDocument(userId, cv);
  return saved;
}
