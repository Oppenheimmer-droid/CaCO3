import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const frontend = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '3000'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false
});

const backend = spawn('node', ['server/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, PORT: '4000' }
});

const shutdown = () => {
  frontend.kill('SIGTERM');
  backend.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
