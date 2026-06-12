import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { verifyAdminSessionToken } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export const requireAdminSession = cache(async () => {
  const cookieStore = await cookies();
  const session = verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin?.isActive) redirect("/admin/login");

  return admin;
});