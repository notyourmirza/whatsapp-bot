import type Database from 'better-sqlite3';

function hasColumn(db: Database.Database, table: string, column: string): boolean {
  return (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).some(row => row.name === column);
}

export const migration003FlowControls = {
  version: 3,
  name: 'flow-controls-and-deduplication',
  up(db: Database.Database): void {
    if (!hasColumn(db, 'pro_flows', 'status')) db.exec("ALTER TABLE pro_flows ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'");
    if (!hasColumn(db, 'pro_flows', 'priority')) db.exec('ALTER TABLE pro_flows ADD COLUMN priority INTEGER NOT NULL DEFAULT 100');
    if (!hasColumn(db, 'pro_flows', 'dedupe_window_seconds')) db.exec('ALTER TABLE pro_flows ADD COLUMN dedupe_window_seconds INTEGER NOT NULL DEFAULT 30');
    if (!hasColumn(db, 'pro_flows', 'settings')) db.exec("ALTER TABLE pro_flows ADD COLUMN settings TEXT NOT NULL DEFAULT '{}'");

    db.exec(`
      CREATE TABLE IF NOT EXISTS pro_flow_dedup (
        flow_id TEXT NOT NULL,
        jid TEXT NOT NULL,
        message_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (flow_id, jid, message_hash),
        FOREIGN KEY (flow_id) REFERENCES pro_flows(id) ON DELETE CASCADE
      )
    `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_pro_flow_dedup_created ON pro_flow_dedup (created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_pro_flows_priority ON pro_flows (enabled, priority, updated_at)');
  },
};
