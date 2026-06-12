import type { Admin } from "@prisma/client";

export interface AdminSessionResponse {
  id: string;
  email: string;
  name: string;
  role: Admin["role"];
  lastLoginAt: string | null;
}

export function toAdminSessionResponse(admin: Admin): AdminSessionResponse {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
  };
}