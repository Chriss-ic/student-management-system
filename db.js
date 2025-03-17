const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./students.db');
const bcrypt = require('bcryptjs');

db.serialize(() => {
  // Create users table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // Create students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      grade TEXT,
      courses TEXT  -- Stored as JSON string
    )
  `);

  // Seed an admin user if it doesn’t exist
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('password', 10);
      db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        ['admin', hashedPassword, 'admin'],
        (err) => {
          if (err) console.error('Error seeding admin user:', err);
          else console.log('Admin user seeded successfully');
        }
      );
    }
  });
});

module.exports = db;