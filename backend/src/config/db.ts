import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbInstance: any = null;
const DB_PATH = path.join(process.cwd(), 'database.sqlite');

export const pool = {
  query: async (sqlText: string, params?: any[]) => {
    if (!dbInstance) throw new Error('DB not initialized');
    
    let modifiedSql = sqlText.replace(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, 'CASE WHEN $1 THEN $2 ELSE $3 END');
    modifiedSql = modifiedSql.replace(/NOW\(\)/g, "datetime('now')");

    try {
      if (params && params.length > 0) {
        const stmt = dbInstance.prepare(modifiedSql);
        stmt.bind(params);
        
        const isSelect = modifiedSql.trim().toUpperCase().startsWith('SELECT');
        
        if (isSelect) {
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return [results, []];
        } else {
          stmt.step();
          stmt.free();
          saveDatabase();
          // SQLite in WebAssembly doesn't easily expose last_insert_rowid without a direct function call
          const [idResult] = dbInstance.exec("SELECT last_insert_rowid() as id");
          const insertId = idResult ? idResult.values[0][0] : 0;
          return [{ insertId, affectedRows: dbInstance.getRowsModified() }];
        }
      } else {
        const isSelect = modifiedSql.trim().toUpperCase().startsWith('SELECT');
        const result = dbInstance.exec(modifiedSql);
        
        if (isSelect) {
          if (result.length === 0) return [[], []];
          const columns = result[0].columns;
          const values = result[0].values;
          
          const rows = values.map((valArray: any[]) => {
            const obj: any = {};
            columns.forEach((col: string, i: number) => {
              obj[col] = valArray[i];
            });
            return obj;
          });
          return [rows, []];
        } else {
          saveDatabase();
          const [idResult] = dbInstance.exec("SELECT last_insert_rowid() as id");
          const insertId = idResult ? idResult.values[0][0] : 0;
          return [{ insertId, affectedRows: dbInstance.getRowsModified() }];
        }
      }
    } catch (err: any) {
      console.error('SQL Execution Error:', err, modifiedSql);
      throw err;
    }
  },
  getConnection: async () => {
    return {
      release: () => {}
    }
  }
};

const saveDatabase = () => {
  if (dbInstance) {
    const data = dbInstance.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
};

export const checkDbConnection = async () => {
  try {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_PATH)) {
      const filebuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(filebuffer);
      console.log('Loaded existing SQLite Database');
    } else {
      dbInstance = new SQL.Database();
      console.log('Created new SQLite Database');
    }

    await pool.query(`
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
    const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM subjects');
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO subjects (title, slug, description, is_published) VALUES 
        ('React Basics', 'react-basics', 'Learn the basics of React with hands-on examples.', 1);
      `);
      await pool.query(`
        INSERT INTO sections (subject_id, title, order_index) VALUES 
        (1, 'Introduction to React', 1),
        (1, 'Components & Props', 2);
      `);
      await pool.query(`
        INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES 
        (1, 'What is React?', 'An intro to the library.', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 1, 300),
        (1, 'JSX Syntax', 'JSX explained in depth', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 2, 400),
        (2, 'Functional Components', 'Create your first component', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 1, 500);
      `);
      console.log('Seeded database with initial courses');
      saveDatabase();
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
