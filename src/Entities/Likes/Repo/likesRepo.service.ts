import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../../Repos/Mongoose/MongooseRepo";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LikeDocument, LikeDto } from "./Schema/like.schema";

@Injectable()
export class LikesRepoService extends MongooseRepo<LikeDto, LikeDto, LikeDocument>{
    constructor(@InjectModel(LikeDto.name) private likeModel: Model<LikeDto>) {
        super(likeModel);
    }
 }