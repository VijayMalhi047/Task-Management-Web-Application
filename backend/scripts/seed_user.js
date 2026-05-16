require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initializeStore, run, query } = require('../config/database');

const EMAIL = process.env.SEED_EMAIL || 'tester@example.com';
const USERNAME = process.env.SEED_USERNAME || 'tester';
const PASSWORD = process.env.SEED_PASSWORD || 'password123';

(async () => {
  try {
    await initializeStore();

    const [existing] = query('SELECT * FROM users WHERE email = ?', [EMAIL]);
    if (existing && existing.verified) {
      console.log('User already exists and is verified:', EMAIL);
      process.exit(0);
    }

    const hash = await bcrypt.hash(PASSWORD, 12);

    if (existing && !existing.verified) {
      run(
        `UPDATE users SET username = ?, password_hash = ?, verified = 1 WHERE email = ?`,
        [USERNAME, hash, EMAIL]
      );
      console.log('Updated existing user and marked verified:', EMAIL);
    } else {
      run(
        `INSERT INTO users (username, email, password_hash, verified) VALUES (?, ?, ?, 1)`,
        [USERNAME, EMAIL, hash]
      );
      console.log('Created verified user:', EMAIL);
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err && err.message);
    process.exit(1);
  }
})();
