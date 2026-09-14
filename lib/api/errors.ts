export class ApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly code?: string;
  constructor(
    message: string,
    options: {
      status: number;
      errorCode?: string;
      details?: unknown;
      requestId?: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.errorCode = options.errorCode;
    this.code = options.errorCode;
    this.details = options.details;
    this.requestId = options.requestId;
  }
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
const stringValue = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined;
export function createApiError(
  status: number,
  payload: unknown,
  fallbackMessage = `HTTP ${status}`,
  requestId?: string,
) {
  const body = isRecord(payload) ? payload : {};
  const nested = isRecord(body.error) ? body.error : {};
  const raw = nested.message ?? body.message;
  const message = Array.isArray(raw)
    ? raw.filter((v): v is string => typeof v === 'string').join(', ')
    : (stringValue(raw) ??
      stringValue(nested.title) ??
      stringValue(body.error) ??
      fallbackMessage);
  return new ApiError(message, {
    status,
    errorCode:
      stringValue(nested.error_code) ??
      stringValue(body.error_code) ??
      stringValue(nested.code) ??
      stringValue(body.code),
    details: nested.details ?? body.details,
    requestId:
      stringValue(nested.request_id) ??
      stringValue(body.request_id) ??
      stringValue(nested.requestId) ??
      stringValue(body.requestId) ??
      requestId,
  });
}
