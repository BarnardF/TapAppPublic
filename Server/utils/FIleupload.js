// firebaseupload
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");
const fs = require("fs");

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../dependencies/firebase-service-account.json")),
    storageBucket: "mobileapp-8e213.firebasestorage.app" 
  });
}

const bucket = getStorage().bucket();

/**
 * @param {Object} file - The file object (e.g., from multer).
 * @param {string} folder - The folder in Firebase Storage (e.g., "taps")
 * @returns {Promise<string>} The public download URL
 */


async function uploadFileToFirebase(file, folder = "images") {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) return reject("No file provided");

      // Define destination path inside Firebase Storage
      const destination = `${folder}/${Date.now()}_${file.originalname}`;

      // Upload the file
      await bucket.upload(file.path, {
        destination,
        public: true,
        metadata: {
          cacheControl: "public, max-age=31536000"
        }
      });

      // Remove temp file (from multer / uploads)
      fs.unlinkSync(file.path);

      // Generate signed URL (long expiry)
      const [url] = await bucket.file(destination).getSignedUrl({
        action: "read",
        expires: "03-09-2491"
      });

      resolve(url);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Remove file from Firebase
 * @param {string} filePath 
 * @returns {Promise<void>}
 */

async function removeFileFromFirebase(filePath) {
  try {
    if (!filePath) throw new Error("No file path provided");

    await bucket.file(filePath).delete();
    console.log(`File deleted: ${filePath}`);
  } catch (err) {
    if (err.code === 404) {
      console.error(`File not found: ${filePath}`);
    } else {
      console.error("Error deleting file:", err);
    }
    throw err;
  }
}


module.exports = { uploadFileToFirebase, removeFileFromFirebase };

