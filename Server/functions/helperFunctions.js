const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Redic client connection - mishka()
const { client } = require('../controllers/RedisClient');

// ============================================
// USER MANAGEMENT FUNCTIONS ai(claude) assisted
// ============================================
/**
 * Get user by email from Redis
 */
async function getUserByEmail(email) {
  try {
    const userData = await client.hGetAll(`user:${email}`);
    if (!userData || Object.keys(userData).length === 0) {
      return null;
    }
    return userData;
  } catch (e) {
    console.error('Error getting user:', e);
    throw e;
  }
}

/**
 * Create new user in Redis, default role is "user"
 */
async function createUser(email, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userData = {
      email: email,
      password_hash: password_hash,
      role: 'user',
      created_at: new Date().toISOString()
    };

    // Store in Redis, and add users to list
    await client.hSet(`user:${email}`, userData);
    await client.sAdd('users:all', email);

    return email;
  } catch (e) {
    console.error('Error creating user:', e);
    throw e;
  }
}

/**
 * Validate user login and return JWT token
 */
async function validateUserLogin(email, password) {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return { valid: false };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return { valid: false };
    }

    //Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role || "user"
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    return {
      valid: true,
      token: token,
      role: user.role || "user",
      email: user.email
    };
  } catch (e) {
    console.error('Error validating login:', e);
    throw e;
  }
}

/**
 * Check if user has specific role
 * Can be used in route handlers for custom role checks
 */
async function hasRole(email, requiredRole) {
  try {
    const user = await getUserByEmail(email);
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  } catch (err) {
    console.error("Error checking role:", err);
    return false;
  }
}

/**
 * Get user's current role
 */
async function getUserRole(email) {
  try {
    const user = await getUserByEmail(email);
    return user ? user.role : null;
  } catch (err) {
    console.error("Error getting user role:", err);
    return null;
  }
}


// ============================================
// TAP MANAGEMENT FUNCTIONS ai(claude) assisted
// ============================================
/**
 * Get all taps from Redis
 */
async function getAllTaps(filters = {}) {
  try {
    // Get all tap IDs
    const tapIds = await client.lRange('taps:ids', 0, -1);
    
    if (!tapIds || tapIds.length === 0) {
      return [];
    }
    
    // Get all tap data
    const taps = [];
    for (const id of tapIds) {
      const tapData = await client.hGetAll(`tap:${id}`);
      if (tapData && Object.keys(tapData).length > 0) {
        taps.push({ id, ...tapData });
      }
    }
    
    // Apply filters if provided
    let filteredTaps = taps;
    
    if (filters.activeOnly) {
      // Only return active taps (optional filter)
      filteredTaps = taps.filter(tap => tap.status !== 'inactive');
    }
    
    if (filters.category) {
      filteredTaps = filteredTaps.filter(tap => tap.category === filters.category);
    }
    
    return filteredTaps;
  } catch (err) {
    console.error('Error getting all taps:', err);
    throw err;
  }
}

/**
 * Get single tap by ID
 */
async function getTapById(id) {
  try {
    const tapData = await client.hGetAll(`tap:${id}`);
    
    if (!tapData || Object.keys(tapData).length === 0) {
      return null;
    }
    
    return { id, ...tapData };
  } catch (err) {
    console.error('Error getting tap by ID:', err);
    throw err;
  }
}

/**
 * Create new tap in Redis
 */
async function createTap(tapData) {
  try {
    // Generate unique ID
    const id = Date.now().toString();
    
    // Store tap data
    await client.hSet(`tap:${id}`, tapData);
    
    // Add to taps:ids list
    await client.rPush('taps:ids', id);
    
    // Add to category set
    if (tapData.category) {
      await client.sAdd(`taps:by:category:${tapData.category}`, id);
    }
    
    return id;
  } catch (err) {
    console.error('Error creating tap:', err);
    throw err;
  }
}

/**
 * Update tap in Redis
 */
async function updateTap(id, updates) {
  try {
    // Check if tap exists
    const exists = await client.exists(`tap:${id}`);
    if (!exists) {
      return false;
    }
    
    // Get old category before update
    const oldTap = await client.hGetAll(`tap:${id}`);
    const oldCategory = oldTap.category;
    
    // Update tap data
    await client.hSet(`tap:${id}`, updates);
    
    // Update category set if category changed
    if (updates.category && updates.category !== oldCategory) {
      // Remove from old category
      if (oldCategory) {
        await client.sRem(`taps:by:category:${oldCategory}`, id);
      }
      // Add to new category
      await client.sAdd(`taps:by:category:${updates.category}`, id);
    }
    
    return true;
  } catch (err) {
    console.error('Error updating tap:', err);
    throw err;
  }
}

/**
 * Delete tap from Redis
 */
async function deleteTap(id) {
  try {
    // Get tap data to find category
    const tapData = await client.hGetAll(`tap:${id}`);
    
    if (!tapData || Object.keys(tapData).length === 0) {
      return false;
    }
    
    // Delete from tap hash
    await client.del(`tap:${id}`);
    
    // Remove from taps:ids list
    await client.lRem('taps:ids', 0, id);
    
    // Remove from category set
    if (tapData.category) {
      await client.sRem(`taps:by:category:${tapData.category}`, id);
    }
    
    return true;
  } catch (err) {
    console.error('Error deleting tap:', err);
    throw err;
  }
}

/**
 * Query taps by specifications
 */
async function queryTaps(filters) {
  try {
    let taps = await getAllTaps();
    
    if (filters.liquid_type) {
      taps = taps.filter(tap => tap.liquid_type === filters.liquid_type);
    }
    
    if (filters.material) {
      taps = taps.filter(tap => tap.material === filters.material);
    }
    
    if (filters.flow_rate) {
      taps = taps.filter(tap => tap.flow_rate === filters.flow_rate);
    }
    
    if (filters.size) {
      taps = taps.filter(tap => tap.size === filters.size);
    }
    
    if (filters.container_type) {
      taps = taps.filter(tap => tap.container_type === filters.container_type);
    }
    
    return taps;
  } catch (err) {
    console.error('Error querying taps:', err);
    throw err;
  }
}

/**
 * Get system statistics
 */
async function getStats() {
  try {
    const allTaps = await getAllTaps();
    
    //Count taps by liquid_type
    const tapsByLiquidType = {
      Water: 0,
      Oil: 0,
      Wine: 0
    };
    
    allTaps.forEach(tap => {
      if (tapsByLiquidType.hasOwnProperty(tap.liquid_type)) {
        tapsByLiquidType[tap.liquid_type]++;
      }
    });
    
    // Count users (user:*)
    const userKeys = await client.keys('user:*');
    const totalUsers = userKeys ? userKeys.length : 0;
    
    return {
      totalTaps: allTaps.length,
      tapsByLiquidType: tapsByLiquidType,
      totalUsers: totalUsers
    };
  } catch (err) {
    console.error('Error getting stats:', err);
    throw err;
  }
}


module.exports = {
    getUserByEmail,
    createUser,
    validateUserLogin,
    hasRole,
    getUserRole,
    
    getAllTaps,
    getTapById,
    createTap,
    updateTap,
    deleteTap,
    queryTaps,
    getStats
};