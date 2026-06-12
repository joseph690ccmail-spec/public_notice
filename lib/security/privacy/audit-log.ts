export type AuditEntityType = "notice" | "draft" | "payment";

export interface AuditLogEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  actorId: string;
  actorRole: "system" | "admin" | "webhook";
  changedFields?: Record<string, { before: unknown; after: unknown }>;
  createdAt: string;
  ipHash?: string;
}

export interface AuditLogWriter {
  write(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<AuditLogEntry>;
}

const auditEntries: AuditLogEntry[] = [];

/** In-memory audit trail for MVP — persist to DB in production. */
export const inMemoryAuditLog: AuditLogWriter = {
  async write(entry) {
    const record: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    auditEntries.push(record);
    return record;
  },
};

let activeAuditLog: AuditLogWriter = inMemoryAuditLog;

export function setAuditLogWriter(writer: AuditLogWriter): void {
  activeAuditLog = writer;
}

export function getAuditLogWriter(): AuditLogWriter {
  return activeAuditLog;
}

export async function logNoticeCorrection(params: {
  noticeId: string;
  actorId: string;
  changes: Record<string, { before: unknown; after: unknown }>;
  ipHash?: string;
}): Promise<AuditLogEntry> {
  return activeAuditLog.write({
    entityType: "notice",
    entityId: params.noticeId,
    action: "notice.corrected",
    actorId: params.actorId,
    actorRole: "admin",
    changedFields: params.changes,
    ipHash: params.ipHash,
  });
}