import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const webRoot = resolve(import.meta.dirname, '..');
const apiRoot = resolve(webRoot, '../api');
const apiUrl = 'http://localhost:50001/api/v1';
const apiHealthUrl = 'http://localhost:50001/health/live';
const postgresContainer = `nexus-estate-web-precommit-postgres-${process.pid}`;

function log(message) {
  process.stdout.write(`${message}\n`);
}

const lifecycleEnv = {
  NODE_ENV: 'development',
  PORT: '50001',
  DB_POSTGRES_HOST: '127.0.0.1',
  DB_POSTGRES_USER: 'postgres',
  DB_POSTGRES_PASS: 'postgres',
  DB_POSTGRES_NAME: 'nexus_estate_dev',
  DB_POSTGRES_ADMIN_NAME: 'postgres',
  CUSTOMER_JWT_ACCESS_SECRET: 'ci-lifecycle-customer-access-secret-32',
  CUSTOMER_JWT_REFRESH_SECRET: 'ci-lifecycle-customer-refresh-secret-32',
  ADMIN_JWT_ACCESS_SECRET: 'ci-lifecycle-admin-access-secret-32',
  ADMIN_JWT_REFRESH_SECRET: 'ci-lifecycle-admin-refresh-secret-32',
  INITIAL_ADMIN_EMAIL: 'superadmin@nexus-estate.local',
  INITIAL_ADMIN_PASSWORD: 'NexusEstate#SuperAdmin2026!',
  CORS_ORIGINS: 'http://localhost:3000',
  SWAGGER_ENABLED: 'false',
};

function run(label, command, args, options = {}) {
  log(`\n[local-ci] ${label}`);

  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? webRoot,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
    });

    child.once('error', rejectRun);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(
        new Error(
          `${label} failed with ${signal ? `signal ${signal}` : `exit code ${code}`}`,
        ),
      );
    });
  });
}

async function waitFor(label, check, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      if (await check()) {
        log(`[local-ci] ${label}: ready`);
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await delay(2_000);
  }

  throw new Error(
    `${label} was not ready within ${timeoutMs / 1000}s${lastError ? `: ${lastError.message}` : ''}`,
  );
}

async function dockerPort() {
  const result = await new Promise((resolveRun, rejectRun) => {
    const child = spawn('docker', ['port', postgresContainer, '5432/tcp'], {
      cwd: webRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.once('error', rejectRun);
    child.once('exit', (code) => {
      if (code !== 0) {
        rejectRun(new Error('Unable to determine the PostgreSQL host port'));
        return;
      }
      resolveRun(output.trim());
    });
  });

  const match = result.match(/:(\d+)$/m);
  if (!match) {
    throw new Error(`Unexpected docker port output: ${result}`);
  }
  return match[1];
}

async function startPostgres() {
  await run('Start isolated PostgreSQL', 'docker', [
    'run',
    '--detach',
    '--name',
    postgresContainer,
    '--publish',
    '127.0.0.1::5432',
    '--env',
    'POSTGRES_USER=postgres',
    '--env',
    'POSTGRES_PASSWORD=postgres',
    '--env',
    'POSTGRES_DB=nexus_estate_dev',
    'postgres:18-alpine',
  ]);

  const port = await dockerPort();
  lifecycleEnv.DB_POSTGRES_PORT = port;

  await waitFor('PostgreSQL', async () => {
    const result = await new Promise((resolveRun) => {
      const child = spawn(
        'docker',
        [
          'exec',
          postgresContainer,
          'pg_isready',
          '-U',
          'postgres',
          '-d',
          'nexus_estate_dev',
        ],
        { cwd: webRoot, env: process.env, stdio: 'ignore' },
      );
      child.once('error', () => resolveRun(false));
      child.once('exit', (code) => resolveRun(code === 0));
    });
    return result;
  });
}

async function waitForApi(apiProcess) {
  await waitFor('API health endpoint', async () => {
    if (apiProcess.exitCode !== null) {
      throw new Error(`API exited with code ${apiProcess.exitCode}`);
    }

    const response = await fetch(apiHealthUrl);
    return response.ok;
  });
}

async function startApi() {
  const apiProcess = spawn('npm', ['run', 'start:prod'], {
    cwd: apiRoot,
    env: { ...process.env, ...lifecycleEnv },
    stdio: 'inherit',
  });

  apiProcess.once('error', (error) => {
    process.stderr.write(`[local-ci] API process error: ${error.message}\n`);
  });
  await waitForApi(apiProcess);
  return apiProcess;
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await waitFor('API shutdown', () => child.exitCode !== null, 10_000).catch(
    () => {
      child.kill('SIGKILL');
    },
  );
}

async function main() {
  await run('Prettier check', 'npm', ['run', 'format:check']);
  await run('Internationalization check', 'npm', ['run', 'i18n:check']);
  await run('Lint', 'npm', ['run', 'lint']);
  await run('Type check', 'npm', ['run', 'type-check']);
  await run('Unit tests', 'npm', ['test', '--', '--ci', '--no-cache'], {
    env: { NEXT_PUBLIC_API_URL: apiUrl },
  });
  await run('Production build', 'npm', ['run', 'build'], {
    env: { NEXT_PUBLIC_API_URL: apiUrl },
  });
  await run('Web E2E', 'npm', ['run', 'test:e2e'], {
    env: { CI: '1', NEXT_PUBLIC_API_URL: apiUrl },
  });
  await run('Docker Compose validation', 'docker', ['compose', 'config']);
  await run('Docker image build', 'docker', [
    'build',
    '--build-arg',
    `NEXT_PUBLIC_API_URL=${apiUrl}`,
    '-t',
    'nexus-estate-web:local',
    '.',
  ]);

  if (!existsSync(resolve(apiRoot, 'package.json'))) {
    throw new Error(
      'Full-stack lifecycle requires the sibling ../api checkout',
    );
  }

  let apiProcess;
  try {
    await run('API build', 'npm', ['run', 'build'], { cwd: apiRoot });
    await startPostgres();
    await run('API migrations', 'npm', ['run', 'migration:run:prod'], {
      cwd: apiRoot,
      env: lifecycleEnv,
    });
    apiProcess = await startApi();
    await run(
      'Full-stack Platform Lifecycle E2E',
      'npm',
      ['run', 'test:e2e', '--', 'platform-lifecycle.spec.ts'],
      {
        env: {
          CI: '1',
          E2E_INTEGRATION: 'true',
          NEXT_PUBLIC_API_URL: apiUrl,
        },
      },
    );
  } finally {
    await stopProcess(apiProcess);
    await run('Remove isolated PostgreSQL', 'docker', [
      'rm',
      '--force',
      postgresContainer,
    ]).catch((error) =>
      process.stderr.write(`[local-ci] cleanup warning: ${error.message}\n`),
    );
  }

  log('\n[local-ci] Full local CI gate passed.');
}

main().catch((error) => {
  process.stderr.write(`\n[local-ci] FAILED: ${error.message}\n`);
  process.exitCode = 1;
});
