import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runMigrations } from './migrate';

// A controllable fake pg client.
const clientMock = {
  query: vi.fn(),
  release: vi.fn(),
};
const poolMock = { connect: vi.fn(async () => clientMock) };

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();
  return {
    isDbConfigured: vi.fn(() => true),
    getPool: vi.fn(() => poolMock),
    splitSqlStatements: actual.splitSqlStatements,
  };
});

describe('runMigrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientMock.query.mockReset();
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['0000_init.sql', '0001_stats.sql'] as never);
    vi.spyOn(fs, 'readFileSync').mockImplementation((_p, _enc) => 'CREATE TABLE ...;' as never);
  });

  it('applies unapplied migrations in order', async () => {
    clientMock.query
      .mockResolvedValueOnce({ rowCount: 0 }) // CREATE TABLE schema_migrations (no rows returned)
      .mockResolvedValueOnce({ rowCount: 0 }) // SELECT 1 for 0000 -> not applied
      .mockResolvedValueOnce({ rowCount: 0 }) // CREATE TABLE schema_migrations
      .mockResolvedValueOnce({ rowCount: 0 }) // SELECT 1 for 0000 -> not applied
      .mockResolvedValueOnce({ rowCount: 0 }) // run 0000 statement(s)
      .mockResolvedValueOnce({ rowCount: 0 }) // INSERT 0000
      .mockResolvedValueOnce({ rowCount: 0 }) // SELECT 1 for 0001 -> not applied
      .mockResolvedValueOnce({ rowCount: 0 }) // run 0001 statement(s)
      .mockResolvedValueOnce({ rowCount: 0 }); // INSERT 0001

    const applied = await runMigrations();

    expect(applied).toEqual(['0000_init.sql', '0001_stats.sql']);
    expect(clientMock.query).toHaveBeenCalledWith('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at text NOT NULL)');
    // Each migration was read from disk and executed, then recorded.
    expect(fs.readFileSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'src', 'db', 'migrations', '0000_init.sql'), 'utf-8');
    expect(fs.readFileSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'src', 'db', 'migrations', '0001_stats.sql'), 'utf-8');
  });

  it('skips already-applied migrations', async () => {
    clientMock.query.mockImplementation((sql: string) =>
      Promise.resolve({ rowCount: String(sql).includes('SELECT 1 FROM schema_migrations') ? 1 : 0 })
    );

    const applied = await runMigrations();
    expect(applied).toEqual([]);
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  it('returns empty when the migrations directory is missing', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    clientMock.query.mockResolvedValueOnce({ rowCount: 0 }); // CREATE TABLE schema_migrations

    const applied = await runMigrations();
    expect(applied).toEqual([]);
    expect(fs.readdirSync).not.toHaveBeenCalled();
  });

  it('releases the client connection', async () => {
    clientMock.query.mockResolvedValue({ rowCount: 0 });
    await runMigrations();
    expect(clientMock.release).toHaveBeenCalled();
  });
});
