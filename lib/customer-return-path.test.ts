import { safeCustomerNext } from './customer-return-path';

test.each([
  [null, '/'],
  ['', '/'],
  ['/provider', '/provider'],
  ['/provider/account', '/provider/account'],
  ['/provider/onboarding', '/provider/onboarding'],
  ['/provider/authorization', '/provider/authorization'],
  ['/profile?tab=security', '/profile?tab=security'],
  ['//evil.example', '/'],
  ['https://evil.example', '/'],
  ['javascript:alert(1)', '/'],
  ['not-a-path', '/'],
  ['/provider\\account', '/'],
  ['/%E0%A4%A', '/'],
] as const)('accepts only safe Customer next values: %s', (value, expected) => {
  expect(safeCustomerNext(value)).toBe(expected);
});
