import { AdminRole, PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/admin/password";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SUPER_ADMIN_EMAIL ?? "admin@publicnotice.ng").trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "ChangeMeNow!123";
  const name = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

  if (password.length < 12) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log(`Seeded super admin: ${admin.email} (${admin.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });