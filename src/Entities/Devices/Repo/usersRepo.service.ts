import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../../Repos/Mongoose/MongooseRepo";
import { UserDocument, UserDto } from "./Schema/devices.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UsersRepoService extends MongooseRepo<UserDto, UserDto, UserDocument>{
    constructor(@InjectModel(UserDto.name) private userModel: Model<UserDto>) {
        super(userModel);
    }
}