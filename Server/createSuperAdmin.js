// createSuperAdmin.js
// Manually create SuperAdmin account in database
// Usage: node createSuperAdmin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('redis');

// 🛠️ Fix invalid protocol automatically (no need to edit .env)
let redisUrl = process.env.REDIS_URL;
if (!redisUrl || !redisUrl.startsWith('redis://')) {
  redisUrl = 'redis://localhost:6379';
  console.log(`⚠️  Invalid or missing REDIS_URL. Using default: ${redisUrl}`);
}

const client = createClient({ url: redisUrl });

async function createSuperAdmin() {
  try {
    await client.connect();

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    const existingUser = await client.hGetAll(`user:${superAdminEmail}`);
    if (existingUser && Object.keys(existingUser).length > 0) {
      console.log('SuperAdmin already exists!');
      console.log(`Email: ${superAdminEmail}`);
      await client.quit();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(superAdminPassword, salt);

    const userData = {
      email: superAdminEmail,
      password_hash,
      role: 'SuperAdmin',
      created_at: new Date().toISOString(),
      created_by: 'system',
    };

    await client.hSet(`user:${superAdminEmail}`, userData);
    await client.sAdd('users:all', superAdminEmail);

    console.log('\n✅ SuperAdmin created successfully!');
    console.log('════════════════════════════════════');
    console.log(`Email: ${superAdminEmail}`);
    console.log(`Password: ${superAdminPassword}`);
    console.log(`Role: SuperAdmin`);
    console.log('════════════════════════════════════');
    console.log('\n⚠️  SECURITY REMINDER:');
    console.log('1. Change this password after first login.');
    console.log('2. Remove SUPER_ADMIN_PASSWORD from .env.');
    console.log('3. Store credentials securely.\n');

    await client.quit();
  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
