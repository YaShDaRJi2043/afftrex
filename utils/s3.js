const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const { s3Bucket } = require("@config/config");

// Initialize S3 client
const s3 = new S3Client({
  region: s3Bucket.region,
  credentials: {
    accessKeyId: s3Bucket.accessKeyId,
    secretAccessKey: s3Bucket.secretAccessKey,
  },
});

const uploadToS3 = async (buffer, originalName, folder = "companiesLogos") => {
  const fileExtension = path.extname(originalName);
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const fileName = `${folder}/${timestamp}${fileExtension}`;

  const params = {
    Bucket: s3Bucket.bucket,
    Key: fileName,
    Body: buffer,
    ContentType: getContentType(fileExtension),
  };

  const command = new PutObjectCommand(params);

  await s3.send(command);

  return fileName;
};

const getContentType = (ext) => {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
};

module.exports = { uploadToS3 };
