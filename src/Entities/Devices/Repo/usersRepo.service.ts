import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../../Repos/Mongoose/MongooseRepo";
import { DeviceDocument, DeviceDto} from "./Schema/devices.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateDeviceDto } from "./Dtos/devices.dto.create";

@Injectable()
export class DeviceRepoService extends MongooseRepo<DeviceDto, DeviceDto, DeviceDocument>{
    constructor(@InjectModel(DeviceDto.name) private deviceModel: Model<DeviceDto>) {
        super(deviceModel);
    }
}