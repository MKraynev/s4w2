import { Injectable } from "@nestjs/common";
import { CrudService } from "../../Common/Services/crudService";
import { CreateDeviceDto } from "./Repo/Dtos/devices.dto.create";
import { DeviceDocument, DeviceDto } from "./Repo/Schema/devices.schema";
import { DeviceRepoService } from "./Repo/usersRepo.service";
import { MongooseFindUnit, MongooseRepoFindPattern_AND, MongooseRepoFindPattern_EXCEPT } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";
import { RefreshTokenData } from "../../Auth/Tokens/token.refresh.data";
import { BlogDto } from "../Blogs/Repo/Schema/blog.schema";
import { DeviceInfo } from "./Repo/Dtos/devices.dto.return";

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
    public async GetUserDevices(refreshToken: RefreshTokenData) {
        let userDevices = await this.UsersDevices(refreshToken.id);

        let formatedDevices: DeviceInfo[] = userDevices.map(device => {
            let devInfo: DeviceInfo = {
                ip: device.ip,
                title: device.name,
                lastActiveDate: device.refreshTime.toISOString(),
                deviceId: device.id
            }
            return devInfo
        })

        return formatedDevices;
    }

    public async DisableRestDevices(refreshToken: RefreshTokenData) {
        let findByUserId: MongooseFindUnit<DeviceDto> = {
            field: "userId",
            value: refreshToken.id
        }
        let exceptDeviceId: MongooseFindUnit<DeviceDto> = {
            field: '_id',
            value: refreshToken.device
        }
        let findPattern: MongooseRepoFindPattern_EXCEPT<DeviceDto> = new MongooseRepoFindPattern_EXCEPT(exceptDeviceId, findByUserId);

        let count = await this.deviceRepo.DeleteByPattern(findPattern);
        
        return count > 0 ? true : false;

    }

    private async UsersDevices(userId: string, limit: number = 20): Promise<DeviceDocument[]> {
        let findByUserId: MongooseFindUnit<DeviceDto> = { field: "userId", value: userId }
        let searchPattern: MongooseRepoFindPattern_AND<BlogDto> = new MongooseRepoFindPattern_AND(findByUserId);

        let devices = await this.deviceRepo.FindByPatterns(searchPattern, "name", "asc", 0, limit) as DeviceDocument[];
        return devices;
    }
}