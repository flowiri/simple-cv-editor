import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL
  || "postgresql://cv_user:cv_password@db:5432/cv_builder";

export const pool = new Pool({
  connectionString,
});

export async function getLatestCv() {
  const result = await pool.query(
    "SELECT document FROM cvs ORDER BY updated_at DESC LIMIT 1"
  );
  return result.rows[0]?.document || null;
}

export async function saveCvDocument(cv) {
  const result = await pool.query(
    `
      INSERT INTO cvs (id, name, document)
      VALUES ($1::uuid, $2, $3::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        document = EXCLUDED.document,
        updated_at = NOW()
      RETURNING document
    `,
    [cv.id, cv.name, JSON.stringify(cv)]
  );

  return result.rows[0]?.document || cv;
}
