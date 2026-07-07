import fs from "fs/promises";
import path from "path";

/**
 * Reusable upload service.
 * In a real production setup, this can be swapped with a Cloudinary or S3 uploader.
 * Currently, it writes files locally to the public/uploads directory.
 *
 * @param {Buffer} fileBuffer - The buffer of the uploaded file
 * @param {string} fileName - Original filename
 * @param {string} mimeType - The mime type of the file
 * @returns {Promise<string>} The public URL path of the uploaded file
 */
export async function uploadImage(fileBuffer, fileName, mimeType) {
  // Extract or fallback extension
  let extension = fileName.split(".").pop();
  if (!extension) {
    extension = mimeType.split("/")[1] || "jpg";
  }
  
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension.toLowerCase()}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  
  // Ensure directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  
  const filePath = path.join(uploadDir, uniqueName);
  
  // Write the file
  await fs.writeFile(filePath, fileBuffer);
  
  // Return public URL path
  return `/uploads/${uniqueName}`;
}
