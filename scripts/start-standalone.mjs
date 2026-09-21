import { spawn } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const projectRoot = resolve(process.cwd());
const standaloneRoot = resolve(projectRoot, '.next/standalone');

const copyLock = resolve(projectRoot, '.next/standalone-copy.lock');

async function copyRuntimeAssets() {
  while (true) {
    try {
      await mkdir(copyLock);
      break;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      await delay(50);
    }
  }

  try {
    await cp(
      resolve(projectRoot, '.next/static'),
      resolve(standaloneRoot, '.next/static'),
      { recursive: true, force: true },
    );
    await cp(
      resolve(projectRoot, 'public'),
      resolve(standaloneRoot, 'public'),
      {
        recursive: true,
        force: true,
      },
    );
  } finally {
    await rm(copyLock, { recursive: true, force: true });
  }
}

await copyRuntimeAssets();

const server = spawn(process.execPath, ['server.js'], {
  cwd: standaloneRoot,
  env: process.env,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}

server.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
