import { Module } from '@nestjs/common';
import { DevicesRepoModule } from './Repo/usersRepo.module';
import { DeviceService } from './devices.service';

@Module({
  imports: [DevicesRepoModule],
  providers: [DeviceService],
  exports:[DeviceService]
})
export class DevicesModule {}