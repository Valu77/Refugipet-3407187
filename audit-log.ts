type AuditEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'EMAIL_VERIFIED';

interface AuditLogEntry {
  timestamp: string;
  event: AuditEvent;
  userId?: string;
  ip?: string;
  reason?: string;
}function writeAuditLog(entry: AuditLogEntry): void {
  console.warn('[AUDIT]', JSON.stringify(entry));
}

export function logLoginSuccess(userId: string, ip: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'LOGIN_SUCCESS',
    userId,
    ip,
  });
}
export function logLoginFailed(reason: string, ip?: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'LOGIN_FAILED',
    reason,
    ip,
  });
}

export function logPasswordChanged(userId: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'PASSWORD_CHANGED',
    userId,
  });
}export function logPasswordResetRequested(): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'PASSWORD_RESET_REQUESTED',
  });
}

export function logEmailVerified(userId: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'EMAIL_VERIFIED',
    userId,
  });
}