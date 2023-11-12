import { MongooseModule } from "@nestjs/mongoose";
import { DeviceRepoService } from "./usersRepo.service";
import { Module } from "@nestjs/common";
import { DeviceDto, DeviceSchema } from "./Schema/devices.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: DeviceDto.name, schema: DeviceSchema }])],
    providers: [DeviceRepoService],
    exports: [DeviceRepoService]
})
export class DevicesRepoModule { }