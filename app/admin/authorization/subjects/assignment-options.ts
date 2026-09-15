import type {
  AuthorizationRole,
  AuthorizationSubjectDetail,
} from '@/lib/api/administration/types';

export type AssignmentRoleOption = {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'DISABLED';
  assigned: boolean;
  canAdd: boolean;
  canRemove: boolean;
};

type CurrentRole = AuthorizationSubjectDetail['roles'][number];

function statusOf(role: Pick<CurrentRole, 'status'> | AuthorizationRole) {
  return role.status.toUpperCase() === 'DISABLED' ? 'DISABLED' : 'ACTIVE';
}

/**
 * Merges the complete active catalogue with the subject's current roles.
 * Disabled assignments are intentionally retained so an operator can remove
 * them instead of having them disappear from the replacement editor.
 */
export function buildAssignmentRoleOptions(
  currentRoles: CurrentRole[],
  catalogueRoles: AuthorizationRole[],
): AssignmentRoleOption[] {
  const currentById = new Map(currentRoles.map((role) => [role.id, role]));
  const catalogueById = new Map(catalogueRoles.map((role) => [role.id, role]));
  const ids = [
    ...currentRoles.map((role) => role.id),
    ...catalogueRoles
      .filter((role) => !currentById.has(role.id))
      .map((role) => role.id),
  ];

  return ids.map((id) => {
    const current = currentById.get(id);
    const catalogue = catalogueById.get(id);
    const status = statusOf(current ?? catalogue!);
    return {
      id,
      name: current?.name ?? catalogue?.name ?? id,
      code: current?.code ?? catalogue?.code ?? id,
      status,
      assigned: Boolean(current),
      canAdd: status === 'ACTIVE',
      canRemove: true,
    };
  });
}

export function selectedDisabledRoleIds(
  options: AssignmentRoleOption[],
  selectedIds: string[],
): string[] {
  const disabled = new Set(
    options
      .filter((option) => option.status === 'DISABLED')
      .map((role) => role.id),
  );
  return selectedIds.filter((id) => disabled.has(id));
}

/** Produces the backend replacement payload without disabled role IDs. */
export function activeSelectedRoleIds(
  options: AssignmentRoleOption[],
  selectedIds: string[],
): string[] {
  const active = new Set(
    options
      .filter((option) => option.status === 'ACTIVE')
      .map((role) => role.id),
  );
  return selectedIds.filter((id) => active.has(id));
}
