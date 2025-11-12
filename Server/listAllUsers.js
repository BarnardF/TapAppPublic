// listAllUsers.js
// List all users stored in Redis (works with Docker setup)
// Usage: node listAllUsers.js

// require('dotenv').config();
const { client, connect } = require('./controllers/RedisClient');

async function listAllUsers() {
  try {
    await connect(); // ✅ uses same logic as the rest of your app

    // Fetch all stored users
    const userEmails = await client.sMembers('users:all');

    if (!userEmails || userEmails.length === 0) {
      console.log('\n📭 No users found in Redis.\n');
      await client.quit();
      return;
    }

    console.log(`\n👥 Found ${userEmails.length} user(s):\n`);
    for (const email of userEmails) {
      const userData = await client.hGetAll(`user:${email}`);
      if (Object.keys(userData).length === 0) continue;

      console.log('══════════════════════════════════════');
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🔐 Role: ${userData.role}`);
      console.log(`🕒 Created At: ${userData.created_at}`);
      console.log(`👤 Created By: ${userData.created_by || 'system'}`);
    }
    console.log('══════════════════════════════════════\n');

    await client.quit();
  } catch (error) {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  }
}

listAllUsers();
