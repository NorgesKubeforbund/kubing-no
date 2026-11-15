import { query } from "@/db";
import { Maybe, User, UserData, UserOverview } from "@/types";
import { getCurrentYear, toNorwayDateString } from "@/lib/time";
import { getYearsAsMember, isUserMember } from "@/lib/membership";
import { hasUserActiveAgreement } from "@/lib/agreement";

export async function getUserData(userId: number): Promise<Maybe<UserData>> {
  const userRes = await getUser(userId);
  if (!userRes.success) {
    return { success: false };
  }
  const user = userRes.data;
  const isMember = await isUserMember(userId);
  const hasActiveAgreement = await hasUserActiveAgreement(userId);
  const yearsAsMember = await getYearsAsMember(userId);
  return {
    success: true,
    data: {
      ...user,
      isMember,
      hasActiveAgreement,
      userId,
      yearsAsMember,
    }
  };
}

export async function getUser(userId: number): Promise<Maybe<User>> {
  const res = await query(`
    SELECT 
      name,
      wca_id AS "wcaId",
      email,
      dob,
      address,
      post_code AS "postCode",
      post_area AS "postArea"
    FROM users
    WHERE id = $1
  `, [userId]);
  if (!res.rowCount) {
    return { success: false };
  }
  const row = res.rows[0];
  return {
    success: true,
    data: {
      name: row.name,
      wcaId: row.wcaId,
      email: row.email,
      dob: row.dob,
      address: row.address ? {
        address: row.address,
        postCode: row.postCode,
        postArea: row.postArea,
      } : null,
    }
  };
}

export async function getUsers(): Promise<UserOverview[]> {
  const manualPaymentYear = 2026;
  const usersRes = await query(`
    SELECT
      u.id,
      u.name,
      u.wca_id AS "wcaId",
      u.email,
      u.dob,
      u.address,
      u.post_code AS "postCode",
      u.post_area AS "postArea",
      u.created_at AS "createdAt",
      EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.user_id = u.id AND m.year = $1
      ) AS "isMember",
      EXISTS (
        SELECT 1 FROM agreements a
        WHERE a.user_id = u.id AND a.status = 'ACTIVE'
      ) AS "hasActiveAgreement",
      COALESCE((
        SELECT ARRAY_AGG(m.year ORDER BY m.year)
        FROM memberships m
        WHERE m.user_id = u.id
      ), '{}') AS "yearsAsMember",
      COALESCE((
        SELECT JSON_OBJECT_AGG(m.year, TO_CHAR(m.created_at AT TIME ZONE 'Europe/Oslo', 'YYYY-MM-DD'))
        FROM memberships m
        WHERE m.user_id = u.id
      ), '{}') AS "membershipPaymentDates"
    FROM users u

    UNION ALL

    SELECT
      NULL AS id,
      mp.name,
      mp.wca_id AS "wcaId",
      mp.email,
      mp.dob,
      mp.address,
      mp.post_code AS "postCode",
      mp.post_area AS "postArea",
      mp.created_at AS "createdAt",
      $2::int = $1 AS "isMember",
      FALSE AS "hasActiveAgreement",
      ARRAY[$2::int] AS "yearsAsMember",
      JSON_BUILD_OBJECT($2::int, TO_CHAR(mp.created_at AT TIME ZONE 'Europe/Oslo', 'YYYY-MM-DD')) AS "membershipPaymentDates"
    FROM manual_payments mp
  `, [getCurrentYear(), manualPaymentYear]);
  const collator = new Intl.Collator("nb", { sensitivity: "base" });
  return usersRes.rows.sort((a, b) => collator.compare(a.name, b.name)).map(row => ({
    userId: row.id,
    name: row.name,
    wcaId: row.wcaId,
    email: row.email,
    dob: row.dob,
    address: row.address ? {
      address: row.address,
      postCode: row.postCode,
      postArea: row.postArea,
    } : null,
    createdAt: toNorwayDateString(row.createdAt),
    isMember: row.isMember,
    hasActiveAgreement: row.hasActiveAgreement,
    yearsAsMember: row.yearsAsMember,
    membershipPaymentDates: row.membershipPaymentDates,
  }));
}
