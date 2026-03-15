import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

// Mock the mysql2 Pool interface mapping to SQLite outputs
export const pool = {
  query: async (sqlText: string, params?: any[]) => {
    if (!dbInstance) throw new Error('DB not initialized');
    
    // Convert MySQL IF(cond, true, false) to SQLite CASE WHEN cond THEN true ELSE false END
    let modifiedSql = sqlText.replace(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, 'CASE WHEN $1 THEN $2 ELSE $3 END');
    // Convert MySQL NOW() to SQLite date('now') or datetime('now')
    modifiedSql = modifiedSql.replace(/NOW\(\)/g, "datetime('now')");

    const method = modifiedSql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';
    const result = await dbInstance[method](modifiedSql, params || []);
    
    if (method === 'all') {
       return [result, []]; // Return array [rows, fields] like mysql2
    } else {
       // Insert or Update returning [ { insertId: x } ]
       return [{ insertId: (result as any).lastID, affectedRows: (result as any).changes }];
    }
  },
  getConnection: async () => {
    return {
      release: () => {}
    }
  }
};

export const checkDbConnection = async () => {
  try {
    dbInstance = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    console.log('SQLite Database connected successfully');

    // Setup SQLite Schema mimicking MySQL
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        is_published BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        youtube_url TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS video_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        last_position_seconds INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT 0,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        UNIQUE (user_id, video_id)
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Seed Data
    const row = await dbInstance.get('SELECT COUNT(*) as count FROM subjects');
    if (row.count === 0) {
      await dbInstance.exec(`
        INSERT INTO subjects (title, slug, description, is_published) VALUES 
        ('React Basics', 'react-basics', 'Learn the basics of React with hands-on examples.', 1);

        INSERT INTO sections (subject_id, title, order_index) VALUES 
        (1, 'Introduction to React', 1),
        (1, 'Components & Props', 2);

        INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES 
        (1, 'What is React?', 'An intro to the library.', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 1, 300),
        (1, 'JSX Syntax', 'JSX explained in depth', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 2, 400),
        (2, 'Functional Components', 'Create your first component', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 1, 500);
      `);
      console.log('Seeded database with initial courses');
    }

  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
