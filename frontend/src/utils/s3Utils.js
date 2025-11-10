/**
 * Utility functions for S3 file handling
 */

/**
 * Constructs S3 file URL from fileKey
 * @param {string} fileKey - The S3 key/path stored in database
 * @returns {string|null} - The full S3 URL or null if fileKey is invalid
 */
export function getS3FileUrl(fileKey) {
  if (!fileKey) return null;

  // If fileKey is already a URL (legacy data), return as is
  if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
    return fileKey;
  }

  // Get bucket name from environment variable or use default
  // Default matches backend: lmsprojects3bucket (from application.properties)
  const bucketName =
    import.meta.env.VITE_S3_BUCKET_NAME || "lmsprojects3bucket";

  // Construct S3 public URL
  // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
  // For us-east-2 region, the format is: https://{bucket}.s3.amazonaws.com/{key}
  return `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
}

/**
 * Gets file extension from fileKey or URL
 * @param {string} fileKey - The S3 key or URL
 * @returns {string} - File extension (e.g., 'pdf', 'docx') or empty string
 */
export function getFileExtension(fileKey) {
  if (!fileKey) return "";
  // Extract filename from path
  const filename = fileKey.split("/").pop() || fileKey;
  // Get extension
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Gets a viewer URL for the file (opens in browser instead of downloading)
 * @param {string} fileKey - The S3 key stored in database
 * @returns {string|null} - Viewer URL that opens in browser
 */
export function getFileViewerUrl(fileKey) {
  if (!fileKey) return null;

  const s3Url = getS3FileUrl(fileKey);
  if (!s3Url) return null;

  const extension = getFileExtension(fileKey);

  // For images, open directly in browser (they usually don't download)
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return s3Url;
  }

  // For PDFs and Office documents, use Google Docs Viewer
  // This ensures files open in browser for viewing instead of downloading
  // Users can still download from the viewer if needed
  const supportedViewerTypes = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "rtf",
  ];

  if (supportedViewerTypes.includes(extension)) {
    // Google Docs Viewer - opens file in browser for viewing
    // The viewer allows users to view and download from within the browser
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      s3Url
    )}&embedded=true`;
  }

  // For other file types, return direct URL
  // Note: These may download depending on browser/S3 settings
  return s3Url;
}
