import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const webRoot = resolve(import.meta.dirname, '..');
const apiRoot = resolve(webRoot, process.env.NEXUS_API_ROOT ?? '../api');
const expectedApiRef = process.env.NEXUS_API_EXPECTED_REF ?? 'origin/develop';
let apiPort = process.env.NEXUS_LOCAL_CI_API_PORT ?? '50001';
let apiUrl = `http://localhost:${apiPort}/api/v1`;
let apiHealthUrl = `http://localhost:${apiPort}/health/live`;
const localPlatformUrls = {
  NEXT_PUBLIC_MARKETPLACE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_PROVIDER_URL: 'http://localhost:3001',
  NEXT_PUBLIC_ADMIN_URL: 'http://localhost:3002',
};
const postgresContainer = `nexus-estate-web-precommit-postgres-${process.pid}`;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function gitValue(args, label) {
  try {
    return execFileSync('git', ['-C', apiRoot, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}: ${details}`);
  }
}

function remoteBranchRef(ref) {
  if (ref.startsWith('refs/heads/')) return ref;
  if (ref.startsWith('origin/'))
    return `refs/heads/${ref.slice('origin/'.length)}`;
  return null;
}

function resolveExpectedApiRevision() {
  const branchRef = remoteBranchRef(expectedApiRef);
  if (!branchRef) {
    return {
      sha: gitValue(
        ['rev-parse', '--verify', `${expectedApiRef}^{commit}`],
        `Unable to resolve expected API ref ${expectedApiRef}`,
      ),
      source: 'local checkout',
    };
  }

  const remoteResult = gitValue(
    ['ls-remote', '--exit-code', '--refs', 'origin', branchRef],
    `Unable to query expected API ref ${expectedApiRef} from origin`,
  );
  const [sha] = remoteResult.split(/\s+/);
  if (!/^[0-9a-f]{40}$/i.test(sha)) {
    throw new Error(
      `Unexpected SHA returned for expected API ref ${expectedApiRef}: ${sha || '(missing)'}`,
    );
  }

  return {
    sha,
    source: `origin ${branchRef}`,
  };
}

function validateApiRevision() {
  if (!existsSync(resolve(apiRoot, 'package.json'))) {
    throw new Error(
      `API repository is missing at ${apiRoot}. Set NEXUS_API_ROOT to a Nexus Estate API checkout.`,
    );
  }

  let packageName;
  try {
    packageName = JSON.parse(
      readFileSync(resolve(apiRoot, 'package.json'), 'utf8'),
    ).name;
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read API package metadata: ${details}`);
  }
  if (packageName !== 'nexus-estate-api')
    throw new Error(
      `Unexpected API repository at ${apiRoot}: package name is ${packageName ?? '(missing)'}, expected nexus-estate-api.`,
    );

  const repositoryRoot = gitValue(
    ['rev-parse', '--show-toplevel'],
    'API checkout is not a Git repository',
  );
  const branch =
    gitValue(['branch', '--show-current'], 'Unable to read API branch') ||
    '(detached HEAD)';
  const head = gitValue(
    ['rev-parse', '--verify', 'HEAD^{commit}'],
    'Unable to resolve API HEAD',
  );
  const { sha: expected, source: expectedSource } =
    resolveExpectedApiRevision();
  let remote = '(not configured)';
  try {
    remote = gitValue(
      ['remote', 'get-url', 'origin'],
      'Unable to read API origin',
    );
  } catch {
    // A remote is useful context, but the selected expected ref is authoritative.
  }

  log(`[local-ci] API repository: ${repositoryRoot}`);
  log(`[local-ci] API remote: ${remote}`);
  log(`[local-ci] API branch: ${branch}`);
  log(`[local-ci] API SHA: ${head}`);
  log(`[local-ci] Expected CI ref: ${expectedApiRef}`);
  log(`[local-ci] Expected CI source: ${expectedSource}`);
  log(`[local-ci] Expected CI SHA: ${expected}`);

  if (head !== expected) {
    throw new Error(
      `API revision mismatch.\n\nExpected:\n${expectedApiRef} @ ${expected}\n\nCurrent:\n${branch} @ ${head}\n\nCheckout the API revision used by CI or explicitly set NEXUS_API_EXPECTED_REF before running the local gate.`,
    );
  }
  log('[local-ci] API revision parity: PASS');
}

const lifecycleEnv = {
  NODE_ENV: 'development',
  PORT: apiPort,
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
  CORS_ORIGINS:
    'http://localhost:3000,http://localhost:3001,http://localhost:3002',
  SWAGGER_ENABLED: 'false',
};

function canListenOn(port) {
  return new Promise((resolvePort) => {
    const server = createServer();
    const finish = (available) => {
      server.removeAllListeners();
      if (server.listening) server.close(() => resolvePort(available));
      else resolvePort(available);
    };
    server.once('error', () => finish(false));
    server.listen(Number(port), '127.0.0.1', () => finish(true));
  });
}

function findEphemeralPort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => {
        if (port) resolvePort(String(port));
        else rejectPort(new Error('Unable to select a local API port'));
      });
    });
  });
}

async function selectApiPort() {
  const requestedPort = process.env.NEXUS_LOCAL_CI_API_PORT;
  if (requestedPort) {
    if (!(await canListenOn(requestedPort))) {
      throw new Error(
        `Requested local CI API port ${requestedPort} is already in use. Set NEXUS_LOCAL_CI_API_PORT to another free port.`,
      );
    }
  } else if (!(await canListenOn(apiPort))) {
    apiPort = await findEphemeralPort();
  }

  apiUrl = `http://localhost:${apiPort}/api/v1`;
  apiHealthUrl = `http://localhost:${apiPort}/health/live`;
  lifecycleEnv.PORT = apiPort;
  log(`[local-ci] API port: ${apiPort}`);
}

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
  validateApiRevision();
  await selectApiPort();
  await run('Prettier check', 'npm', ['run', 'format:check']);
  await run('Internationalization check', 'npm', ['run', 'i18n:check']);
  await run('Lint', 'npm', ['run', 'lint']);
  await run('Type check', 'npm', ['run', 'type-check']);
  await run('Unit tests', 'npm', ['test', '--', '--ci', '--no-cache'], {
    env: { NEXT_PUBLIC_API_URL: apiUrl, ...localPlatformUrls },
  });
  await run('Production build', 'npm', ['run', 'build'], {
    env: { NEXT_PUBLIC_API_URL: apiUrl, ...localPlatformUrls },
  });
  await run('Web E2E', 'npm', ['run', 'test:e2e'], {
    env: {
      CI: '1',
      NEXT_PUBLIC_API_URL: apiUrl,
      ...localPlatformUrls,
      WEB_PLATFORM: 'marketplace',
    },
  });
  for (const [platform, port] of [
    ['provider', '3001'],
    ['admin', '3002'],
  ]) {
    await run(
      `Web ${platform} platform smoke`,
      'npm',
      ['run', 'test:e2e', '--', 'e2e/platform-boundary.spec.ts'],
      {
        env: {
          CI: '1',
          E2E_PORT: port,
          NEXT_PUBLIC_API_URL: apiUrl,
          ...localPlatformUrls,
          WEB_PLATFORM: platform,
        },
      },
    );
  }
  await run('Docker Compose validation', 'docker', ['compose', 'config']);
  await run('Docker image build', 'docker', [
    'build',
    '--build-arg',
    `NEXT_PUBLIC_API_URL=${apiUrl}`,
    '--build-arg',
    `NEXT_PUBLIC_MARKETPLACE_URL=${localPlatformUrls.NEXT_PUBLIC_MARKETPLACE_URL}`,
    '--build-arg',
    `NEXT_PUBLIC_PROVIDER_URL=${localPlatformUrls.NEXT_PUBLIC_PROVIDER_URL}`,
    '--build-arg',
    `NEXT_PUBLIC_ADMIN_URL=${localPlatformUrls.NEXT_PUBLIC_ADMIN_URL}`,
    '-t',
    'nexus-estate-web:local',
    '.',
  ]);

  let apiProcess;
  try {
    await run('API build', 'npm', ['run', 'build'], { cwd: apiRoot });
    await startPostgres();
    await run('API migrations', 'npm', ['run', 'migration:run:prod'], {
      cwd: apiRoot,
      env: lifecycleEnv,
    });
    await run(
      'Seed isolated location fixtures',
      'npm',
      ['run', 'seed:location'],
      {
        cwd: apiRoot,
        env: lifecycleEnv,
      },
    );
    apiProcess = await startApi();
    await run(
      'Full-stack Platform Lifecycle E2E',
      'npm',
      [
        'run',
        'test:e2e',
        '--',
        'platform-lifecycle.spec.ts',
        'provider-supply-lifecycle.spec.ts',
        'cross-platform-navigation.spec.ts',
      ],
      {
        env: {
          CI: '1',
          E2E_INTEGRATION: 'true',
          E2E_MULTI_PLATFORM: 'true',
          E2E_PORT: '3000',
          E2E_PROVIDER_PORT: '3001',
          E2E_ADMIN_PORT: '3002',
          NEXT_PUBLIC_API_URL: apiUrl,
          ...localPlatformUrls,
          WEB_PLATFORM: 'marketplace',
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
