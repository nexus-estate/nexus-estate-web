// Re-export from the official SDK package.
// This adapter file exists so that all internal imports use `@/lib/sdk` consistently.
// If the SDK package API changes, only this file needs updating.
export { Configuration, ApiClient } from '@nexus-estate/typescript-sdk';
export type * from '@nexus-estate/typescript-sdk';
