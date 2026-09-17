import mysql, { Pool, PoolConnection } from 'mysql2/promise'

let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL
    if (connectionUri) {
      pool = mysql.createPool({
        uri: connectionUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false },
      })
    } else {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
        user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
        password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'expense_tracker_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      })
    }
  }
  return pool
}

let schemaInitialized = false

export async function ensureSchemaInitialized(): Promise<void> {
  if (schemaInitialized) return

  const p = getDbPool()
  const conn: PoolConnection = await p.getConnection()
  try {
    // 1. Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `)

    // 2. Spending Profile Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS spending_profile (
        profile_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        monthly_income DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        savings_target DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    // 3. Budgets Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        budget_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        baseline_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_category (user_id, category_name)
      ) ENGINE=InnoDB;
    `)

    // 4. Expenses Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        expense_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        expense_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    schemaInitialized = true
  } finally {
    conn.release()
  }
}
