export interface ApiFilters {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  isSystem?: boolean;
  permissionCode?: string;
  riskLevel?: string;
  includeDeprecated?: boolean;
  from?: string;
  to?: string;
  actorAdministratorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  category?: string;
  resource?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  roleId?: string;
}
export function buildSearchParams(filters: ApiFilters = {}): string {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(filters)) {
    if (raw === undefined || raw === null || raw === '') continue;
    const value = key === 'page' ? Math.max(1, Number(raw)) : raw;
    params.set(key, String(value));
  }
  return params.toString();
}
