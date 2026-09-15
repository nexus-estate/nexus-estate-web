import type { AuthorizationRole } from '@/lib/api/administration/types';
import {
  activeSelectedRoleIds,
  buildAssignmentRoleOptions,
  selectedDisabledRoleIds,
} from './assignment-options';

const role = (overrides: Partial<AuthorizationRole>): AuthorizationRole => ({
  id: 'role-id',
  code: 'ROLE',
  name: 'Role',
  description: null,
  isSystem: false,
  status: 'ACTIVE',
  version: 1,
  permissionCount: 0,
  assignmentCount: 0,
  allowedActions: {
    updateMetadata: true,
    updateStatus: true,
    updatePermissions: true,
    delete: true,
  },
  isEditable: true,
  isDeletable: true,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

test('builds an active-only assignment editor for active assignments', () => {
  const options = buildAssignmentRoleOptions(
    [{ id: 'active-a', code: 'ACTIVE_A', name: 'Active A', status: 'ACTIVE' }],
    [
      role({ id: 'active-a', code: 'ACTIVE_A', name: 'Active A' }),
      role({ id: 'active-c', code: 'ACTIVE_C', name: 'Active C' }),
    ],
  );

  expect(options).toMatchObject([
    {
      id: 'active-a',
      assigned: true,
      status: 'ACTIVE',
      canAdd: true,
      canRemove: true,
    },
    {
      id: 'active-c',
      assigned: false,
      status: 'ACTIVE',
      canAdd: true,
      canRemove: true,
    },
  ]);
  expect(selectedDisabledRoleIds(options, ['active-a', 'active-c'])).toEqual(
    [],
  );
  expect(activeSelectedRoleIds(options, ['active-a', 'active-c'])).toEqual([
    'active-a',
    'active-c',
  ]);
});

test('keeps disabled assignments visible and marks them non-addable but removable', () => {
  const options = buildAssignmentRoleOptions(
    [
      { id: 'active-a', code: 'ACTIVE_A', name: 'Active A', status: 'ACTIVE' },
      {
        id: 'disabled-b',
        code: 'LEGACY_B',
        name: 'Legacy Broker',
        status: 'DISABLED',
      },
    ],
    [
      role({ id: 'active-a', code: 'ACTIVE_A', name: 'Active A' }),
      role({ id: 'active-c', code: 'ACTIVE_C', name: 'Active C' }),
    ],
  );

  expect(options).toContainEqual({
    id: 'disabled-b',
    name: 'Legacy Broker',
    code: 'LEGACY_B',
    status: 'DISABLED',
    assigned: true,
    canAdd: false,
    canRemove: true,
  });
  expect(selectedDisabledRoleIds(options, ['active-a', 'disabled-b'])).toEqual([
    'disabled-b',
  ]);
  expect(activeSelectedRoleIds(options, ['active-a', 'disabled-b'])).toEqual([
    'active-a',
  ]);
});
