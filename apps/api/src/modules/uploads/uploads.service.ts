import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME', ''),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY', ''),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET', ''),
    });
  }

  /**
   * Upload an image buffer to Cloudinary.
   * Returns the secure URL and public_id.
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'tableo',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image must be smaller than 5 MB');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 1200, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result?: UploadApiResponse) => {
            if (error || !result) {
              this.logger.error('Cloudinary upload failed', error);
              return reject(new BadRequestException('Image upload failed'));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        )
        .end(file.buffer);
    });
  }

  /**
   * Delete an image from Cloudinary by its public_id.
   */
  async deleteImage(publicId: string): Promise<{ deleted: boolean }> {
    if (!publicId) throw new BadRequestException('publicId is required');

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { deleted: result.result === 'ok' };
    } catch (error) {
      this.logger.error('Cloudinary delete failed', error);
      throw new BadRequestException('Image deletion failed');
    }
  }
}
