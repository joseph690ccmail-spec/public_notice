import type { Admin } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { toAdminSessionResponse, type AdminSessionResponse } from "@/lib/admin/dto";
import { verifyPassword } from "@/lib/admin/password";
import {
  createAdminSessionToken,
  getAdminSessionFromRequest,
  type AdminSessionPayload,
} from "@/lib/admin/session";
import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ admin: Admin; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin || !admin.isActive) {
    throw new ApiError("UNAUTHORIZED", "Invalid email or password.");
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    throw new ApiError("UNAUTHORIZED", "Invalid email or password.");
  }

  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const token = createAdminSessionToken({
    adminId: updated.id,
    email: updated.email,
    role: updated.role,
  });

  return { admin: updated, token };
}

export async function resolveAdminSession(
  request: NextRequest
): Promise<AdminSessionResponse | null> {
  const session = getAdminSessionFromRequest(request);
  if (!session) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
  });

  if (!admin || !admin.isActive) return null;
  return toAdminSessionResponse(admin);
}

export function requireAdminSession(request: NextRequest): AdminSessionPayload {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    throw new ApiError("UNAUTHORIZED", "Admin session required.");
  }
  return session;
}