import { Injectable } from "@nestjs/common";
import { CrudService } from "../../Common/Services/crudService";
import { CreateDeviceDto } from "./Repo/Dtos/devices.dto.create";
import { DeviceDocument, DeviceDto } from "./Repo/Schema/devices.schema";
import { DeviceRepoService } from "./Repo/usersRepo.service";
import { MongooseFindUnit, MongooseRepoFindPattern_AND } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";

@Injectable()
export class DeviceService extends CrudService<CreateDeviceDto, DeviceDto, DeviceDocument, DeviceRepoService>{
    constructor(private deviceRepo: DeviceRepoService) {
        super(deviceRepo);
    }

    public async TakeExistOrNewByUserId(userId: string, device: CreateDeviceDto): Promise<DeviceDocument> {
        let findByUserId: MongooseFindUnit<DeviceDto> = { field: "userId", value: userId }
        let findByName: MongooseFindUnit<DeviceDto> = { field: "name", value: device.name }

        let findPattern = new MongooseRepoFindPattern_AND(findByUserId, findByName);
        let foundDevices = await this.deviceRepo.FindByPatterns(findPattern, "createdAt", "desc", 0, 1);
        if (foundDevices.length > 0)
            return foundDevices[0] as DeviceDocument;

        let deviceDto = new DeviceDto(device, userId);
        let savedDto = await this.deviceRepo.SaveDto(deviceDto);

        return savedDto as DeviceDocument;
    }
}