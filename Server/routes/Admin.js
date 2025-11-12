//  Barnard
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const path = require("path");
const os = require("os");

require('dotenv').config();


// controllers - mishka
const { client } = require('../controllers/RedisClient');

// middleware - Albertus, Sebastian
const { verifyAccessToken } = require('../middleware/AuthMiddleware');
const {rateLimitCheck}  = require('../middleware/RatelimiterMiddle');
const { upload } = require('../middleware/UploadMiddleware');
const { verifyAdminRole, verifySuperAdminRole} = require('../middleware/RoleMiddleware') //barnard

//utils - Conrad
const {uploadFileToFirebase, removeFileFromFirebase} = require('../utils/FIleupload'); 
// const publicRouter = require('./Public');

//helper functions - Barnard
const helper = require('../functions/helperFunctions');


// ============================================================================
// PUBLIC ROUTES (Anyone can access)
// ============================================================================
/*
    route 'register' - public user registration
    POST api/admin/register
    validata - ratelimit - store db
    anyone can refister, but they get "user" role by default
*/
router.post('/register', rateLimitCheck,
    async (req, res) => {
        try{
            const {email, password} = req.body;

            //validate input
            if (!email || !password) {
                return res.status(400).json({ //bad request
                    success: false,
                    error: "Email and password are required"
                });
            }

            //email regex validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    success: false,
                    error: "Invalid email format"
                });
            }
            
            //password (min 6 char)
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: "Password must contain 6 or more characters"
                });
            }

            //check if userr exists
            const existingAdmin = await helper.getUserByEmail(email);
            if (existingAdmin) {
                return res.status(409).json({ //409 - conflict, spiderman meme
                    success:false,
                    error: "A admin with this email already exists"
                });
            }

            //create user with 'user' role
            const userId = await helper.createUser(email, password)
            res.status(201).json({ //201 – created, yay
                success: true,
                message: "Registration successfull, wait for admin approval",
                userId: userId,
                role: "user"
            });

        } catch (e) {
            console.error("Error when registering admin:", e);
            res.status(500).json({ //500 – internal server error, oh sh!t
                success: false,
                error: "failed to register user",
                message: e.message
            });
        }
    }
);

/*
    route 'login'
    POST api/admin/login
    validata - ratelimit - validate db - return JWT(json web token)
    anyone can login, JWT includes their role
*/
router.post('/login', rateLimitCheck, 
    async (req, res) => {
        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: "Email and password are required"
                });
            }

            //check credentials
            const result = await helper.validateUserLogin(email, password)
            if (!result.valid) {
                return res.status(401).json({
                    success: false,
                    error: "invalid email or password"
                }); 
            }

            res.json({
                success: true,
                message: "Login successful",
                token: result.token,
                role: result.role,
                email: result.email,
                expiresIn: 3600 //1hour
            });
        } catch (e) {
            console.error("Error during login:", e);
            res.status(500).json({
                success: false,
                error: "login failed",
                message: e.message
            });
        }
    }
);

// ============================================================================
// SUPER ADMIN ONLY ROUTES
// ============================================================================
/*
    route 'users' - get all registered users
    GET api/admin/users
    This is for SuperAdmin to see all users and their roles
*/
router.get('/users', verifyAccessToken, verifySuperAdminRole,
    async (req, res) => {
        try {
            const userEmails = await client.sMembers('users:all')

            //get each user's details
            const users = [];
            for (const email of userEmails) {
                const userData = await helper.getUserByEmail(email);
                if (userData) {
                    users.push({
                        email: userData.email,
                        role: userData.role,
                        created_at: userData.created_at
                    });
                }
            }

            //sort by role (SuperAdmin, admin, user)
            users.sort((a,b) => {
                const roleOrder = { "SuperAdmin": 0, "admin": 1, "user": 2};
                return roleOrder[a.role] - roleOrder[b.role]
            });

            res.json({
                success: true,
                count: users.length,
                users: users
            });
        } catch(e) {
            console.error("error fetching users:", e);
            res.status(500).json({
                success: false,
                error: "failed to fetch users",
                message: e.message
            });
        }
    }
);

/*
    route 'update-role' - Update user role
    PUT api/admin/update-role
    SuperAdmin can change any user's role
*/
router.put('/update-role', verifyAccessToken, verifySuperAdminRole,
    async (req, res) => {
        try {
            const {email, newRole} = req.body;

            if (!email || !newRole) {
                return res.status(400).json({
                    success: false,
                    error: "email and newRole are required"
                });
            }

            const validRoles = ['user', 'admin'];
            if (!validRoles.includes(newRole)) {
                return res.status(400).json({
                    success: false,
                    error: "invalid role, must be: user, admin"
                });
            }

            if (email === req.user.email) {
                return res.status(400).json({
                    success: false,
                    error: "cannot change your own role"
                });
            }

            const user = await helper.getUserByEmail(email);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: "user not found"
                });
            }

            await client.hSet(`user:${email}`, 'role', newRole);
            await client.hSet(`user:${email}`, 'updated_at', new Date().toISOString());
            await client.hSet(`user:${email}`, 'updated_by', req.user.email);

            res.json({
                success: true,
                message: "user role updated successfully",
                user: {
                    email: email,
                    oldRole: user.role,
                    newRole: newRole,
                    updatedBy: req.user.email
                }
            });
        } catch (e) {
            console.error("error updated user role:", e);
            res.status(500).json({
                success: false,
                error: "failed to update user role",
                message: e.message
            });
        }
    }
);

/*
    route 'delete-user' - Delete a user
    DELETE api/admin/delete-user/:email
    SuperAdmin can delete users (except themselves)
*/
router.delete('/delete-user/:email', verifyAccessToken, verifySuperAdminRole,
    async (req, res) => {
        try {
            const {email} = req.params;
            if (email === req.user.email){
                return res.status(400).json({
                    success: false,
                    error: "canmnot delete your own account"
                });
            }

            const user = await helper.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "user not found"
                });
            }

            //delete user
            await client.del(`user:${email}`);
            await client.sRem('users:all', email);

            res.json({
                success: true,
                message: "user deleted successfully",
                deletedEmail: email
            });
        } catch (e) {
            console.error("error deleteing user:", e);
            res.status(500).json({
                success: false,
                error: "failed to delete user",
                message: e.message
            });
        }
    }
);


// ============================================================================
// ADMIN & SUPERADMIN ROUTES (Both can access)
// ============================================================================
/*
    route 'taps' - 5 Oct
    GET api/admin/taps
    AuthMiddleware - RoleMiddleware - validate DB - return taps
*/
router.get('/taps', verifyAccessToken, verifyAdminRole,
    async (req, res) => {
        try{
            const taps = await helper.getAllTaps();
            res.status(200).json({
                success: true,
                taps: taps,
                total: taps.length,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error fetching taps:", e)
            res.status(500).json({
                success: false,
                error: "Failed to fetch taps",
                message: e.message
            });
        }
    }
);

/*
    route 'taps/:id' - 7 Oct
    GET api/admin/taps/:id
    AuthMiddleware - RoleMiddleware - validate DB - return tap 
*/
router.get('/taps/:id', verifyAccessToken, verifyAdminRole, 
    async (req, res) => {
        try {
            const {id} = req.params;
            const tap = await helper.getTapById(id);

            if (!tap) {
                return res.status(404).json({
                    success: false,
                    error: "Tap not found"
                });
            }

            res.json({
                success: true,
                tap: tap
            });
        } catch (e) {
            console.error("error fetching tap:", e);
            res.status(500).json({
                success: false,
                error: "failed to fetch tap",
                message: e.message
            });
        }
    }
);

/*
    Create new tap - 7 Oct
    POST api/admin/taps
    AuthMiddleware - RoleMiddleware - validate - rate limit - validate DB - store file - store DB
*/
router.post('/taps', verifyAccessToken, verifyAdminRole, upload.single('productPictureFile'), rateLimitCheck,
async (req, res) => {
    try {
        const { title, container_type, material, size, flow_rate, liquid_type, description } = req.body;
        
        if (!title || !container_type || !material || !size || !flow_rate || !liquid_type || !description || !req.file) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields or image file"
            });
        }

        const validLiquidTypes = ["Water", "Oil", "Wine"];
        if (!validLiquidTypes.includes(liquid_type)) {
            return res.status(400).json({
                success: false,
                error: "Invalid liquid type, must be: Water, Oil, or Wine"
            });
        }

        // // Upload file to Firebase using buffer
        // let image_url = '';
        // try {
        //     const fakeFile = {
        //         originalname: req.file.originalname,
        //         buffer: req.file.buffer
        //     };
        //     image_url = await uploadFileToFirebase(fakeFile, 'taps');
        // } catch (e) {
        //     console.error("Error uploading image:", e);
        //     return res.status(500).json({
        //         success: false,
        //         error: "Failed to upload image",
        //         message: e.message
        //     });
        // }
        // Create temp file from buffer - ai(claude) helped with this image handling
        const tempFilePath = path.join(os.tmpdir(), `${Date.now()}_${req.file.originalname}`);
        fs.writeFileSync(tempFilePath, req.file.buffer);

        let image_url = '';
        try {
            // Upload file using path
            image_url = await uploadFileToFirebase({ path: tempFilePath, originalname: req.file.originalname });
        } catch (e) {
            console.error("Error uploading image:", e);
            return res.status(500).json({
                success: false,
                error: "Failed to upload image",
                message: e.message
            });
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }        

        const tapData = {
            title,
            container_type,
            material,
            size,
            flow_rate,
            liquid_type,
            description,
            image_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: req.user?.email || "admin"
        };

        const tapId = await helper.createTap(tapData);

        res.status(201).json({
            success: true,
            tapId: tapId,
            message: "Tap created successfully",
            tap: {
                id: tapId,
                ...tapData
            }
        });

    } catch (e) {
        console.error("Error creating tap:", e);
        res.status(500).json({
            success: false,
            error: "Failed to create tap",
            message: e.message
        });
    }
});

/*
    Update existing tap - 7 Oct, Updated on 13 Oct, fixed image update errors
    PUT api/admin/taps/:id
    AuthMiddleware - RoleMiddleware - validate - rate limit - validate DB - update file (if needed) - update DB
*/
router.put('/taps/:id', verifyAccessToken, verifyAdminRole, upload.single('productPictureFile'), rateLimitCheck, 
async (req, res) => {
    try {
        const { title, container_type, material, size, flow_rate, liquid_type, description } = req.body;
        const existingTap = await helper.getTapById(req.params.id);

        if (!existingTap) {
            return res.status(404).json({ 
                success: false, 
                error: "Tap not found" });
        }

        const updates = {
            updated_at: new Date().toISOString(),
            updated_by: req.user?.email || "admin"
        };

        if (title !== undefined) updates.title = title;
        if (container_type !== undefined) updates.container_type = container_type;
        if (material !== undefined) updates.material = material;
        if (size !== undefined) updates.size = size;
        if (flow_rate !== undefined) updates.flow_rate = flow_rate;
        if (liquid_type !== undefined) updates.liquid_type = liquid_type;
        if (description !== undefined) updates.description = description;

        //ai(claude) assisted with imagae handling
        if (req.file) {
            // Delete old image
            if (existingTap.image_url) {
                // const match = existingTap.image_url.match(/\/taps\/[^?]+/);
                // const oldFilePath = match ? match[0].substring(1) : null;
                // if (oldFilePath) {
                //     await removeFileFromFirebase(oldFilePath);
                // }
                try {
                    const urlObj = new URL(existingTap.image_url);
                    let pathname = urlObj.pathname.substring(1); 

                    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
                    if (pathname.startsWith(bucketName)) {
                        pathname = pathname.substring(bucketName.length + 1); 
                    }

                    await removeFileFromFirebase(pathname)

                } catch (e) {
                    console.error("failed to delete old image:",pathname, e.message);
                }
            }

            //upload new image
            const tempFilePath = path.join(os.tmpdir(), `${Date.now()}_${req.file.originalname}`);
            fs.writeFileSync(tempFilePath, req.file.buffer);
            updates.image_url = await uploadFileToFirebase({ path: tempFilePath, originalname: req.file.originalname }, 'taps');

            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }

        //upadte tap
        const success = await helper.updateTap(req.params.id, updates);
        const updatedTap = await helper.getTapById(req.params.id);

        res.json({ 
            success: true, 
            message: "Tap updated successfully", 
            tap: updatedTap 
        });
    } catch (e) {
        console.error("Error updating tap:", e);
        res.status(500).json({ 
            success: false, 
            error: "Failed to update tap", 
            message: e.message 
        });
    }
});

/*
    Delete tap - 7 Oct
    DELETE /api/admin/taps/:id
    AuthMiddleware - RoleMiddleware - validate DB - delete file - delete from DB
*/
router.delete('/taps/:id', verifyAccessToken, verifyAdminRole,
    async (req, res) => {
        try {
            const {id} = req.params;
            const tap = await helper.getTapById(id)
            //get tap to get imgae url
            if (!tap) {
                return res.status(404).json({
                    success: false,
                    error: "tap not found"
                });
            }

            //delete image ai(claude) assisted with image handling
            // if (tap.image_url) {
            //     try {
            //         await removeFileFromFirebase (tap.image_url);
            //     } catch (e) {
            //         console.error("failed to delete image, continuing with tap deleteion", e);
            //     }
            // }
            if (tap.image_url) {
                let pathname = null;
                try {
                    const urlObj = new URL(tap.image_url);
                    pathname = urlObj.pathname.substring(1); // Remove leading "/"
                    
                    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
                    if (pathname.startsWith(bucketName)) {
                        pathname = pathname.substring(bucketName.length + 1);
                    }

                    await removeFileFromFirebase(pathname)

                } catch (e) {
                    console.error("FAiled to delete image, continuing with tap deletion:", pathname, e.message)
                }
            }

            //delete from db
            const success = await helper.deleteTap(id);
            if (!success) {
                return res.status(500).json({
                    success: false,
                    error: "failed to delete tap from database"
                });
            }

            res.json({
                success: true,
                message: "tap deleted successfully",
                deletedId: id
            });
        } catch (e) {
            console.error("error deleting tap:", e);
            res.status(500).json({
                success: false,
                error: "failed to delete tap",
                message: e.message
            });
        }
    }
);

/*
Get system statistics - 7 Oct
DELETE admin/stats
AuthMiddleware - validate DB - return stats
*/
router.get('/stats', verifyAccessToken, verifyAdminRole, 
    async (req, res) => {
        try{
            const stats = await helper.getStats();

            res.json({
                success: true,
                stats: stats,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error("error fetching results:",e);
            res.status(500).json({
                success: false,
                error: "failed to fetch statistics",
                message: e.message
            });
        }
    }
);

router.put('/change-password', verifyAccessToken,
    async (req, res) => {
        try {
            const {currentPassword, newPassword} = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: "both currentPassword and newPassword are required"
                });
            }

            const email = req.user.email;
            const userData = await helper.getUserByEmail(email);

            if (!userData) {
                return res.status(404).json({
                    success: false,
                    error: "user not found"
                });
            }

            const isMatch = await bcrypt.compare(currentPassword, userData.password_hash);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: "current password is incorrect"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(newPassword, salt);

            await client.hSet(`user:${email}`, {password_hash: newHash});

            res.json({
                success: true,
                message: "password updated successfully"
            });
        } catch (e) {
            console.error("error changing password:", e);
            res.status(500).json({
                success: false,
                error: "failed to change password",
                message: e.message
            });
        }
    }
);

module.exports = router;