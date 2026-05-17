/**
 * Dev PostgreSQL launcher using embedded-postgres.
 * Starts an embedded PG, runs Prisma migrations, then launches the server.
 */
import EmbeddedPostgres from 'embedded-postgres';
import { spawn } from 'child_process';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', '.pg-data');
const PG_PORT = 5433;
const DATABASE_URL = `postgresql://postgres:password@localhost:${PG_PORT}/postgres`;

async function ensureDir(dir: string) {
  const { mkdir } = await import('fs/promises');
  try {
    await mkdir(dir, { recursive: true });
  } catch {}
}

async function runMigrations(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['prisma', 'migrate', 'dev', '--name', 'dev-init', '--skip-generate'],
      {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL },
        stdio: 'inherit',
      }
    );
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Prisma migrate exited with code ${code}`));
    });
  });
}

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    port: PG_PORT,
  });

  // Graceful shutdown handler
  const shutdown = async () => {
    console.log('\n[dev-postgres] Shutting down...');
    try { await pg.stop(); } catch {}
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    // Init & start PostgreSQL
    await ensureDir(DATA_DIR);
    console.log('[dev-postgres] Initialising PostgreSQL...');
    await pg.initialise();
    console.log('[dev-postgres] Starting PostgreSQL...');
    await pg.start();
    console.log(`[dev-postgres] PostgreSQL ready on port ${PG_PORT}`);

    // Set env for server
    process.env.DATABASE_URL = DATABASE_URL;
    process.env.REDIS_MOCK = 'true';

    // Run Prisma migrations
    console.log('[dev-postgres] Running Prisma migrations...');
    await runMigrations();
    console.log('[dev-postgres] Migrations complete');

    // Generate Prisma client
    console.log('[dev-postgres] Generating Prisma client...');
    await new Promise<void>((resolve, reject) => {
      const child = spawn('npx', ['prisma', 'generate'], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL },
        stdio: 'inherit',
      });
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Prisma generate exited with code ${code}`));
      });
    });

    // Start the server
    console.log('[dev-postgres] Starting ClipMate server...');
    await import('./server.js');
  } catch (err) {
    console.error('[dev-postgres] Fatal error:', err);
    try { await pg.stop(); } catch {}
    process.exit(1);
  }
}

main();
