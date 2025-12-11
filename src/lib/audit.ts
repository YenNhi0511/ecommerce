import AuditLog from '@/models/AuditLog';

export async function recordAudit(user: any, action: string, resourceType?: string, resourceId?: string, details?: any) {
  try {
    await AuditLog.create({ user: user?._id || null, action, resourceType, resourceId: resourceId ? String(resourceId) : undefined, details });
  } catch (e) {
    console.warn('Failed to create audit log', e);
  }
}
