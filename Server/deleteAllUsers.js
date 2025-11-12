// deleteAllUsers.js
// Deletes ALL user accounts from Redis (use with caution!)
// Usage: node deleteAllUsers.js

require('dotenv').config();
const { client } = require('./controllers/RedisClient');

async function deleteAllUsers() {
  try {
    await client.connect();

    console.log('⚠️  WARNING: This will permanently delete ALL user accounts.\n');

    // Get all users from the "users:all" set
    const users = await client.sMembers('users:all');

    if (!users || users.length === 0) {
      console.log('No users found to delete.');
      await client.quit();
      return;
    }

    console.log(`Found ${users.length} users. Deleting now...`);

    for (const email of users) {
      await client.del(`user:${email}`);
      await client.del(`admin:user:${email}`); // in case admin keys exist
      await client.sRem('users:all', email);
      console.log(`✅ Deleted user: ${email}`);
    }

    // Optionally, clean up other related keys
    const adminKeys = await client.keys('admin:user:*');
    if (adminKeys.length > 0) {
      await Promise.all(adminKeys.map(key => client.del(key)));
      console.log(`✅ Deleted ${adminKeys.length} admin keys`);
    }

    console.log('\n✅ All user accounts deleted successfully.');
    console.log('═══════════════════════════════════════════════');
    console.log('You can now recreate a SuperAdmin using:');
    console.log('   node createSuperAdmin.js');
    console.log('═══════════════════════════════════════════════');

    await client.quit();
  } catch (error) {
    console.error('Error deleting users:', error);
    await client.quit();
    process.exit(1);
  }
}

deleteAllUsers();
