// Sentry is not used in this project.
// These are no-op stubs so existing call sites compile without the package.

export function initSentry(): void {}

export function captureError(_error: unknown, _context?: Record<string, unknown>): void {}

export function addBreadcrumb(_message: string, _data?: Record<string, unknown>): void {}

export function identifySentryUser(_user: { id: string; email?: string } | null): void {}
