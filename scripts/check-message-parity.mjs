import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'messages');
const locales = ['en', 'vi'];
const domains = ['common', 'auth', 'customer', 'provider', 'administration'];
const sourceRoots = ['app', 'components', 'features', 'hooks', 'lib'];

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

function sourceFiles(directory) {
  return readdir(resolve(process.cwd(), directory), {
    recursive: true,
    withFileTypes: true,
  }).then((entries) =>
    entries
      .filter((entry) => entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name))
      .map((entry) => resolve(entry.parentPath, entry.name)),
  );
}

const messageKeys = Object.fromEntries(
  locales.map((locale) => [
    locale,
    new Set(
      domains.flatMap((domain) =>
        paths(catalogs[locale][domain]).map((key) => `${domain}.${key}`),
      ),
    ),
  ]),
);

const files = (
  await Promise.all(sourceRoots.map((sourceRoot) => sourceFiles(sourceRoot)))
).flat();
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const translators = [
    ...source.matchAll(
      /(?:const|let)\s+(\w+)\s*=\s*useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g,
    ),
  ];
  for (const [, variable, namespace] of translators) {
    const calls = new RegExp(
      `\\b${variable}\\(\\s*['"]([^'"]+)['"]\\s*\\)`,
      'g',
    );
    for (const [, key] of source.matchAll(calls)) {
      const fullKey = `${namespace}.${key}`;
      if (!messageKeys.en.has(fullKey) || !messageKeys.vi.has(fullKey)) {
        failures.push(
          `${file.replace(`${process.cwd()}/`, '')} uses missing ${fullKey}`,
        );
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.warn(
    `Message parity OK (${domains.length} domains, ${locales.join(' / ')})`,
  );
}
