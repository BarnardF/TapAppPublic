//helper functions - Barnard
const helper = require('../functions/helperFunctions');



/*
    this is to verify admin role (blocks regular users) 
    Blocks regular users from accessing admin routes
    ai(claude) assisted
 */
async function verifyAdminRole(req, res, next) {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Please login",
        code: "AUTH_REQUIRED"
      });
    }

    const user = await helper.getUserByEmail(req.user.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }
    
    //checks if user has admin or SuperAdmin role
    if (user.role !== 'admin' && user.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        error: "Forbidden - Admin access required",
        message: "You don't have permission to access this resource. Please contact an administrator.",
        code: "INSUFFICIENT_PERMISSIONS",
        currentRole: user.role,
        requiredRole: "admin or SuperAdmin"
      });
    }

    req.user.role = user.role;
    next();
  } catch (err) {
    console.error("Error verifying admin role:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify permissions",
      code: "PERMISSION_CHECK_FAILED"
    });
  }
}

/*
    this is to verify SuperAdmin role only
    Blocks regular users and regular admins
    ai(claude) assisted
 */
async function verifySuperAdminRole(req, res, next) {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Please login",
        code: "AUTH_REQUIRED"
      });
    }

    // Get fresh user data to check current role
    const user = await helper.getUserByEmail(req.user.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }
    
    if (user.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        error: "Forbidden - SuperAdmin access required",
        message: "Only SuperAdmin can perform this action",
        code: "INSUFFICIENT_PERMISSIONS",
        currentRole: user.role,
        requiredRole: "SuperAdmin"
      });
    }

    req.user.role = user.role;
    next();
  } catch (err) {
    console.error("Error verifying SuperAdmin role:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify permissions",
      code: "PERMISSION_CHECK_FAILED"
    });
  }
}

// const verifyVerifiedUser = verifyAdminRole;



module.exports = {
  verifyAdminRole,
  verifySuperAdminRole
};
