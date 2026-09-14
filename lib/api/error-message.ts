import { ApiError } from './core/error';
export const BUSINESS_ERROR_TRANSLATIONS: Record<string, string> = {
  AUTHORIZATION_ROLE_VERSION_CONFLICT: 'errors.roleVersionConflict',
  AUTHORIZATION_ROLE_IN_USE: 'errors.roleInUse',
  AUTHORIZATION_SYSTEM_ROLE_IMMUTABLE: 'errors.systemRoleImmutable',
  AUTHORIZATION_LAST_ADMIN_PROTECTION: 'errors.lastAdminProtection',
  PROVIDER_LAST_OWNER_PROTECTION: 'errors.lastOwnerProtection',
  PROVIDER_CONTEXT_REQUIRED: 'errors.providerContextRequired',
  PROVIDER_ACCOUNT_NOT_FOUND: 'errors.providerAccountNotFound',
};
export function getApiErrorMessage(
  error: unknown,
  translate: (key: string) => string,
) {
  if (
    error instanceof ApiError &&
    error.errorCode &&
    BUSINESS_ERROR_TRANSLATIONS[error.errorCode]
  )
    return translate(BUSINESS_ERROR_TRANSLATIONS[error.errorCode]);
  return error instanceof ApiError
    ? error.message
    : translate('errors.unexpected');
}
