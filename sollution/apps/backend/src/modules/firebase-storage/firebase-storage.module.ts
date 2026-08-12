import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { FirebaseStorageController } from './firebase-storage.controller';
import { FirebaseStorageService } from './firebase-storage.service';

@Module({
  imports: [SharedModule],
  controllers: [FirebaseStorageController],
  providers: [FirebaseStorageService],
})
export class FirebaseStorageModule {}
