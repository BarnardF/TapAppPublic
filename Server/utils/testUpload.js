const path = require("path");
const { uploadFileToFirebase } = require("./FIleupload");

// Simulate a Multer-like file object
const testFile = {
  path: ("C:\\Users\\conra\\Desktop\\awe.jpg"), // make sure this file exists locally
  originalname: "awe.jpg",
};

(async () => {
  try {
    console.log("Uploading file...");
    const url = await uploadFileToFirebase(testFile, "taps");
    console.log("✅ Upload successful!");
    console.log("File URL:", url);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
})();
