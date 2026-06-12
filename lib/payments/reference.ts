import { randomBytes } from "node:crypto";

export function generatePaymentReference(): string {
  return `PNN-${randomBytes(4).toString("hex").toUpperCase()}`;
}