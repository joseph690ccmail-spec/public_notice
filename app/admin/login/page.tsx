import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminLoginShell } from "@/components/admin/AdminLoginShell";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { verifyAdminSessionToken } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (session) redirect("/admin");

  return (
    <AdminLoginShell>
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </AdminLoginShell>
  );
}