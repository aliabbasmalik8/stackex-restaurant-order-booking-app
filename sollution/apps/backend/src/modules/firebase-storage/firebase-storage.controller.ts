import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { handleControllerError } from '@utils/order-booking.exception';
import { FirebaseStorageService } from './firebase-storage.service';

@Controller('firebase-storage')
@UseGuards(AuthGuard, SuperAdminGuard)
export class FirebaseStorageController {
  constructor(private readonly firebaseStorageService: FirebaseStorageService) {}

  /**
   * Upload a product image to Firebase Storage.
   * Returns a public download URL to store on `product.image`.
   */
  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; objectPath: string }> {
    try {
      return await this.firebaseStorageService.uploadProductImage(file);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
