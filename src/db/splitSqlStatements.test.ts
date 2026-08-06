import { describe, it, expect } from 'vitest';
import { splitSqlStatements } from './client';

describe('splitSqlStatements', () => {
  it('splits on drizzle statement-breakpoint markers', () => {
    const sql = `CREATE TABLE "users" (...);
--> statement-breakpoint
CREATE TABLE "progress" (...);`;
    const stmts = splitSqlStatements(sql);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]).toContain('CREATE TABLE "users"');
    expect(stmts[1]).toContain('CREATE TABLE "progress"');
  });

  it('splits semicolon-separated DDL without markers', () => {
    const sql = `CREATE TABLE IF NOT EXISTS a (id text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS b (id text PRIMARY KEY);`;
    const stmts = splitSqlStatements(sql);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].endsWith(';')).toBe(true);
  });

  it('splits drizzle marker appended after the semicolon (drizzle format)', () => {
    const sql = `ALTER TABLE "progress" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" text;`;
    const stmts = splitSqlStatements(sql);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]).toContain('ADD COLUMN "xp"');
    expect(stmts[1]).toContain('ADD COLUMN "created_at"');
    expect(stmts.every((s) => !s.includes('statement-breakpoint'))).toBe(true);
  });

  it('handles CRLF line endings and blank lines', () => {
    const sql = `CREATE TABLE a (id text PRIMARY KEY);\r\n\r\nCREATE TABLE b (id text PRIMARY KEY);`;
    const stmts = splitSqlStatements(sql);
    expect(stmts).toHaveLength(2);
  });

  it('returns an empty array for empty input', () => {
    expect(splitSqlStatements('   \n\n  ')).toEqual([]);
  });

  it('keeps each chunk a single statement (no embedded multi-statement)', () => {
    const chunks = splitSqlStatements(
      `CREATE TABLE "users" ("id" text PRIMARY KEY NOT NULL, "badges" jsonb DEFAULT '[]'::jsonb NOT NULL);
--> statement-breakpoint
CREATE TABLE "progress" ("user_id" text PRIMARY KEY NOT NULL);`
    );
    expect(chunks.length).toBe(2);
    expect(chunks.every((c) => !c.includes('statement-breakpoint'))).toBe(true);
  });
});
