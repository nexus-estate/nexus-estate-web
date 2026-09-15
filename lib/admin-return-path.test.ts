import { safeAdministrationNext } from './admin-return-path';

test.each([
  ['/admin/authorization/subjects/abc', '/admin/authorization/subjects/abc'],
  [
    '/admin/authorization/subjects/abc?platform=PROVIDER',
    '/admin/authorization/subjects/abc?platform=PROVIDER',
  ],
  [
    '/admin/authorization/subjects/abc?platform=ADMINISTRATION',
    '/admin/authorization/subjects/abc?platform=ADMINISTRATION',
  ],
  ['https://evil.example/admin', '/admin'],
  ['//evil.example/admin', '/admin'],
  [null, '/admin'],
] as const)(
  'accepts only safe Administration next values: %s',
  (value, expected) => {
    expect(safeAdministrationNext(value)).toBe(expected);
  },
);
