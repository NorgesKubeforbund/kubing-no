import { getClient, query } from "@/db";
import { getCurrentYear } from "@/lib/time";
import { UserWithWcaId } from "@/types";
import { PoolClient } from "pg";

export async function isUserMemberInYear(userId: number, year: number): Promise<boolean> {
  const res = await query(`
    SELECT EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = $1 AND year = $2
    )
  `, [userId, year]);
  return res.rows[0].exists as boolean;
}

export async function isUserMemberInYearWithClient(userId: number, year: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = $1 AND year = $2
    )
  `, [userId, year]);
  return res.rows[0].exists as boolean;
}

export async function addMembershipIfManuallyPaid(userId: number, wcaId: string, year: number): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const hasManuallyPaid = (await client.query("SELECT * FROM manual_payments WHERE wca_id = $1 FOR UPDATE", [wcaId])).rowCount;
    if (hasManuallyPaid) {
      await client.query(`
        INSERT INTO memberships
        (user_id, year)
        VALUES
        ($1, $2);
      `, [userId, year]);
      await client.query(`
        DELETE FROM manual_payments WHERE wca_id = $1
      `, [wcaId]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
  } finally {
    client.release();
  }
}

export async function isUserMember(userId: number): Promise<boolean> {
  const year = getCurrentYear();
  return isUserMemberInYear(userId, year);
}

export async function getMembersByWcaIds(wcaIds: string[], year: number): Promise<UserWithWcaId[]> {
  const res = await query(`
    SELECT u.name, u.wca_id AS "wcaId"
    FROM users u
    JOIN memberships m ON m.user_id = u.id AND year = $2
    WHERE u.wca_id = ANY($1)
  `, [wcaIds, year]);
  return res.rows;
}

export async function getManualMembersByWcaIds(wcaIds: string[]): Promise<UserWithWcaId[]> {
  const res = await query(`
    SELECT name, wca_id AS "wcaId"
    FROM manual_payments
    WHERE wca_id = ANY($1)
  `, [wcaIds]);
  return res.rows;
}

export async function getAllYearsWithMembers(): Promise<number[]> {
  const res = await query(`
    SELECT DISTINCT year
    FROM memberships
    ORDER BY year DESC
  `, []);
  return res.rows.map(row => row.year);
}

export async function getYearsAsMember(userId: number): Promise<number[]> {
  const res = await query(`
    SELECT year
    FROM memberships
    WHERE user_id = $1
    ORDER BY year
  `, [userId]);
  return res.rows.map(row => row.year);
}
