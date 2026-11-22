import { query } from "@/db";
import { Maybe, User, UserData } from "@/types";
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

export async function getUser(userId: number): Promise<Maybe<User & { wcaEmail: string, contactEmail: string | null }>> {
  const res = await query(`
    SELECT 
      name,
      wca_id AS "wcaId",
      COALESCE(contact_email, wca_email) AS email,
      wca_email AS "wcaEmail",
      contact_email AS "contactEmail",
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
      wcaEmail: row.wcaEmail,
      contactEmail: row.contactEmail,
      dob: row.dob,
      address: row.address ? {
        address: row.address,
        postCode: row.postCode,
        postArea: row.postArea,
      } : null,
    }
  };
}
