import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MatchDataController } from './match-data.controller';
import { MatchDataAdminController } from './match-data-admin.controller';
import { MatchDataService } from './match-data.service';
import { MatchDataImportService } from './services/match-data-import.service';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { DatabaseModule } from '../../database/database.module';
import { CacheModule } from '../../cache/cache.module';
import { AuthModule } from '../auth/auth.module';

const multerConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传Excel文件'), false);
    }
  },
};

@Module({
  imports: [DatabaseModule, CacheModule, AuthModule, MulterModule.register(multerConfig)],
  controllers: [MatchDataController, MatchDataAdminController],
  providers: [MatchDataService, MatchDataImportService, AdminRoleGuard],
  exports: [MatchDataService],
})
export class MatchDataModule {}
