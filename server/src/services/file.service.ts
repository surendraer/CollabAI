// ============================================================
// services/file.service.ts
// Handles file uploading to Cloudinary if keys are set, or
// fallback mock local-store emulation.
// ============================================================
import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import logger from "../utils/logger";
import AppError from "../utils/AppError";
import { HttpStatus } from "../constants";

// Configure Cloudinary if credentials are present
let isCloudinaryConfigured = false;
if (
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  isCloudinaryConfigured = true;
  logger.info("☁️ Cloudinary file service initialized.");
} else {
  logger.warn("⚠️ Cloudinary credentials missing. File service running in MOCK mode.");
}

export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
  sizeBytes: number;
}

export class FileService {
  /**
   * Upload a base64 encoded file string.
   * @param base64Data Data URL e.g. "data:image/png;base64,iVBORw0KGgo..."
   * @param fileName Original filename
   */
  public static async uploadFile(
    base64Data: string,
    fileName: string
  ): Promise<UploadResult> {
    // Basic validation of data size (max 10MB to match Express body limit)
    const base64Length = base64Data.length - (base64Data.indexOf(",") + 1);
    const approximateSize = Math.ceil((base64Length * 3) / 4);

    if (approximateSize > 10 * 1024 * 1024) {
      throw new AppError("File is too large. Max size limit is 10MB.", HttpStatus.BAD_REQUEST);
    }

    // Try to extract mime type
    const mimeMatch = base64Data.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

    if (isCloudinaryConfigured) {
      try {
        const response = await cloudinary.uploader.upload(base64Data, {
          resource_type: "auto",
          folder: "research_collab",
        });

        return {
          url: response.secure_url,
          publicId: response.public_id,
          mimeType,
          sizeBytes: response.bytes || approximateSize,
        };
      } catch (error: any) {
        logger.error("❌ Cloudinary upload failed:", error);
        throw new AppError(`Upload failed: ${error.message || error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      // Mock File Upload (useful for local dev and sandboxed trials)
      logger.info(`🤖 MOCK upload: ${fileName} (${mimeType}, ~${approximateSize} bytes)`);
      
      // Return a simulated URL
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80`, // placeholder image
        publicId: mockId,
        mimeType,
        sizeBytes: approximateSize,
      };
    }
  }

  /**
   * Delete a file from Cloudinary (or mock deletion)
   */
  public static async deleteFile(publicId: string): Promise<void> {
    if (isCloudinaryConfigured && !publicId.startsWith("mock_")) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        logger.error(`❌ Failed to delete asset ${publicId} from Cloudinary:`, error);
      }
    } else {
      logger.info(`🤖 MOCK delete: Asset ${publicId} removed.`);
    }
  }
}

export default FileService;
