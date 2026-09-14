export interface ApiErrorDetails {
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      details?: unknown;
      requestId?: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
  }
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const messages = value.filter(
      (item): item is string => typeof item === 'string',
    );
    return messages.length > 0 ? messages.join(', ') : undefined;
  }
  return undefined;
}

export function createApiError(
  status: number,
  payload: unknown,
  fallbackMessage = `HTTP ${status}`,
  requestId?: string,
): ApiError {
  const body = isRecord(payload) ? payload : {};
  const nestedError = isRecord(body.error) ? body.error : {};
  const message =
    getMessage(nestedError.message) ??
    getMessage(body.message) ??
    getString(nestedError.title) ??
    getString(body.error) ??
    fallbackMessage;

  return new ApiError(message, {
    status,
    code: getString(nestedError.code) ?? getString(body.code),
    details: nestedError.details ?? body.details,
    requestId:
      getString(nestedError.requestId) ??
      getString(body.requestId) ??
      requestId,
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
