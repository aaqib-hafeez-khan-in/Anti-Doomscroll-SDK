import {open, QuickSQLiteConnection} from 'react-native-quick-sqlite';
import {v4 as uuidv4} from 'uuid';
import {Entry, UsageSnapshot, ExportData, MoodTag} from '../types';
import {Logger} from './AnalyticsService';

const DB_NAME = 'antidoomscroll.db';

let db: QuickSQLiteConnection | null = null;

function getDb(): QuickSQLiteConnection {
  if (!db) {
    throw new Error(
      'Database not initialized. Call DatabaseService.initialize() first.',
    );
  }
  return db;
}

const CREATE_ENTRIES_TABLE = `
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    triggered_app TEXT NOT NULL,
    triggered_duration_seconds INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    entry_text TEXT NOT NULL,
    mood TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    time_on_blocker_seconds INTEGER NOT NULL,
    is_manual INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

const CREATE_FTS_TABLE = `
  CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
    entry_text,
    prompt_text,
    content=entries,
    content_rowid=rowid
  );
`;

const CREATE_USAGE_TABLE = `
  CREATE TABLE IF NOT EXISTS usage_snapshots (
    id TEXT PRIMARY KEY,
    app_package TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    snapshot_date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`;

const CREATE_FTS_TRIGGERS = `
  CREATE TRIGGER IF NOT EXISTS entries_ai AFTER INSERT ON entries BEGIN
    INSERT INTO entries_fts(rowid, entry_text, prompt_text)
    VALUES (new.rowid, new.entry_text, new.prompt_text);
  END;

  CREATE TRIGGER IF NOT EXISTS entries_ad AFTER DELETE ON entries BEGIN
    INSERT INTO entries_fts(entries_fts, rowid, entry_text, prompt_text)
    VALUES ('delete', old.rowid, old.entry_text, old.prompt_text);
  END;

  CREATE TRIGGER IF NOT EXISTS entries_au AFTER UPDATE ON entries BEGIN
    INSERT INTO entries_fts(entries_fts, rowid, entry_text, prompt_text)
    VALUES ('delete', old.rowid, old.entry_text, old.prompt_text);
    INSERT INTO entries_fts(rowid, entry_text, prompt_text)
    VALUES (new.rowid, new.entry_text, new.prompt_text);
  END;
`;

function rowToEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as string,
    triggeredApp: row.triggered_app as string,
    triggeredDurationSeconds: row.triggered_duration_seconds as number,
    promptText: row.prompt_text as string,
    entryText: row.entry_text as string,
    mood: row.mood as MoodTag,
    wordCount: row.word_count as number,
    timeOnBlockerSeconds: row.time_on_blocker_seconds as number,
    isManual: (row.is_manual as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToSnapshot(row: Record<string, unknown>): UsageSnapshot {
  return {
    id: row.id as string,
    appPackage: row.app_package as string,
    durationSeconds: row.duration_seconds as number,
    snapshotDate: row.snapshot_date as string,
    createdAt: row.created_at as string,
  };
}

export const DatabaseService = {
  async initialize(): Promise<void> {
    try {
      db = open({name: DB_NAME});
      await db.executeAsync(CREATE_ENTRIES_TABLE);
      await db.executeAsync(CREATE_FTS_TABLE);
      await db.executeAsync(CREATE_USAGE_TABLE);

      const triggers = CREATE_FTS_TRIGGERS.trim()
        .split(';')
        .filter(t => t.trim().length > 0);
      for (const trigger of triggers) {
        await db.executeAsync(`${trigger};`);
      }

      Logger.info('DatabaseService initialized');
    } catch (error) {
      Logger.error('DatabaseService.initialize failed', error);
      throw error;
    }
  },

  async createEntry(
    params: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Entry> {
    const database = getDb();
    const now = new Date().toISOString();
    const id = uuidv4();

    const newEntry: Entry = {
      ...params,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await database.executeAsync(
      `INSERT INTO entries
        (id, triggered_app, triggered_duration_seconds, prompt_text, entry_text,
         mood, word_count, time_on_blocker_seconds, is_manual, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEntry.id,
        newEntry.triggeredApp,
        newEntry.triggeredDurationSeconds,
        newEntry.promptText,
        newEntry.entryText,
        newEntry.mood,
        newEntry.wordCount,
        newEntry.timeOnBlockerSeconds,
        newEntry.isManual ? 1 : 0,
        newEntry.createdAt,
        newEntry.updatedAt,
      ],
    );

    return newEntry;
  },

  async getEntries(): Promise<Entry[]> {
    const database = getDb();
    const result = await database.executeAsync(
      'SELECT * FROM entries ORDER BY created_at DESC',
    );
    return (result.rows?._array ?? []).map(rowToEntry);
  },

  async getEntriesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Entry[]> {
    const database = getDb();
    const result = await database.executeAsync(
      'SELECT * FROM entries WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
      [startDate, endDate],
    );
    return (result.rows?._array ?? []).map(rowToEntry);
  },

  async searchEntries(query: string): Promise<Entry[]> {
    const database = getDb();
    const result = await database.executeAsync(
      `SELECT e.* FROM entries e
       INNER JOIN entries_fts f ON e.rowid = f.rowid
       WHERE entries_fts MATCH ?
       ORDER BY e.created_at DESC`,
      [query],
    );
    return (result.rows?._array ?? []).map(rowToEntry);
  },

  async updateEntry(
    id: string,
    patch: Partial<Omit<Entry, 'id' | 'createdAt'>>,
  ): Promise<void> {
    const database = getDb();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (patch.entryText !== undefined) {
      fields.push('entry_text = ?');
      values.push(patch.entryText);
    }
    if (patch.mood !== undefined) {
      fields.push('mood = ?');
      values.push(patch.mood);
    }
    if (patch.wordCount !== undefined) {
      fields.push('word_count = ?');
      values.push(patch.wordCount);
    }
    if (patch.promptText !== undefined) {
      fields.push('prompt_text = ?');
      values.push(patch.promptText);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await database.executeAsync(
      `UPDATE entries SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  },

  async deleteEntry(id: string): Promise<void> {
    const database = getDb();
    await database.executeAsync('DELETE FROM entries WHERE id = ?', [id]);
  },

  async getUsageStats(
    startDate: string,
    endDate: string,
  ): Promise<UsageSnapshot[]> {
    const database = getDb();
    const result = await database.executeAsync(
      'SELECT * FROM usage_snapshots WHERE snapshot_date >= ? AND snapshot_date <= ? ORDER BY created_at DESC',
      [startDate, endDate],
    );
    return (result.rows?._array ?? []).map(rowToSnapshot);
  },

  async insertUsageSnapshot(
    params: Omit<UsageSnapshot, 'id' | 'createdAt'>,
  ): Promise<UsageSnapshot> {
    const database = getDb();
    const now = new Date().toISOString();
    const id = uuidv4();

    const snapshot: UsageSnapshot = {
      ...params,
      id,
      createdAt: now,
    };

    await database.executeAsync(
      `INSERT INTO usage_snapshots (id, app_package, duration_seconds, snapshot_date, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        snapshot.id,
        snapshot.appPackage,
        snapshot.durationSeconds,
        snapshot.snapshotDate,
        snapshot.createdAt,
      ],
    );

    return snapshot;
  },

  async exportAllData(): Promise<string> {
    const database = getDb();
    const entriesResult = await database.executeAsync(
      'SELECT * FROM entries ORDER BY created_at ASC',
    );
    const snapshotsResult = await database.executeAsync(
      'SELECT * FROM usage_snapshots ORDER BY created_at ASC',
    );

    const exportData: ExportData = {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      entries: (entriesResult.rows?._array ?? []).map(rowToEntry),
      usageSnapshots: (snapshotsResult.rows?._array ?? []).map(rowToSnapshot),
    };

    return JSON.stringify(exportData, null, 2);
  },

  async importData(jsonString: string): Promise<void> {
    const database = getDb();
    let data: unknown;

    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as ExportData).entries)
    ) {
      throw new Error('Invalid data schema');
    }

    const exportData = data as ExportData;

    await database.executeAsync('BEGIN TRANSACTION');

    try {
      for (const entry of exportData.entries) {
        await database.executeAsync(
          `INSERT OR REPLACE INTO entries
            (id, triggered_app, triggered_duration_seconds, prompt_text, entry_text,
             mood, word_count, time_on_blocker_seconds, is_manual, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            entry.id,
            entry.triggeredApp,
            entry.triggeredDurationSeconds,
            entry.promptText,
            entry.entryText,
            entry.mood,
            entry.wordCount,
            entry.timeOnBlockerSeconds,
            entry.isManual ? 1 : 0,
            entry.createdAt,
            entry.updatedAt,
          ],
        );
      }

      for (const snapshot of exportData.usageSnapshots ?? []) {
        await database.executeAsync(
          `INSERT OR REPLACE INTO usage_snapshots
            (id, app_package, duration_seconds, snapshot_date, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [
            snapshot.id,
            snapshot.appPackage,
            snapshot.durationSeconds,
            snapshot.snapshotDate,
            snapshot.createdAt,
          ],
        );
      }

      await database.executeAsync('COMMIT');
    } catch (error) {
      await database.executeAsync('ROLLBACK');
      throw error;
    }
  },

  async deleteAllData(): Promise<void> {
    const database = getDb();
    await database.executeAsync('BEGIN TRANSACTION');
    try {
      await database.executeAsync('DELETE FROM entries');
      await database.executeAsync('DELETE FROM usage_snapshots');
      await database.executeAsync(
        "INSERT INTO entries_fts(entries_fts) VALUES ('rebuild')",
      );
      await database.executeAsync('COMMIT');
    } catch (error) {
      await database.executeAsync('ROLLBACK');
      throw error;
    }
  },
};
