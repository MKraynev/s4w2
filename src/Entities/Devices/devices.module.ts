import { Module } from '@nestjs/common';
import { DevicesRepoModule } from './Repo/usersRepo.module';
import { DeviceService } from './devices.service';
import { DevicesController } from './devices.controller';

@Module({
  imports: [DevicesRepoModule],
  controllers: [DevicesController],
  providers: [DeviceService],
  exports:[DeviceService]
})
export class DevicesModule {}