import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'messages');
const locales = ['en', 'vi'];
const domains = ['common', 'auth', 'customer', 'provider', 'administration'];

function paths(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

const catalogs = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [
      locale,
      Object.fromEntries(
        await Promise.all(
          domains.map(async (domain) => [
            domain,
            JSON.parse(
              await readFile(resolve(root, locale, `${domain}.json`), 'utf8'),
            ),
          ]),
        ),
      ),
    ]),
  ),
);

const failures = [];
for (const domain of domains) {
  const en = new Set(paths(catalogs.en[domain]));
  const vi = new Set(paths(catalogs.vi[domain]));
  for (const key of en)
    if (!vi.has(key)) failures.push(`vi missing ${domain}.${key}`);
  for (const key of vi)
    if (!en.has(key)) failures.push(`en missing ${domain}.${key}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.warn(
    `Message parity OK (${domains.length} domains, ${locales.join(' / ')})`,
  );
}
