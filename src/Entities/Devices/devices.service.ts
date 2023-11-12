import { Injectable } from "@nestjs/common";
import { CrudService } from "../../Common/Services/crudService";
import { CreateDeviceDto } from "./Repo/Dtos/devices.dto.create";
import { DeviceDocument, DeviceDto } from "./Repo/Schema/devices.schema";
import { DeviceRepoService } from "./Repo/usersRepo.service";

@Injectable()
export class DeviceService extends CrudService<CreateDeviceDto, DeviceDto, DeviceDocument, DeviceRepoService>{
    constructor(private deviceRepo: DeviceRepoService) {
        super(deviceRepo);

    }
}