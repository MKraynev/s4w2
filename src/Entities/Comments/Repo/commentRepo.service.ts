import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../../Repos/Mongoose/MongooseRepo";
import { CommentDocument, CommentDto } from "./Schema/comment.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class CommentRepoService extends MongooseRepo<CommentDto, CommentDto, CommentDocument>{
    constructor(@InjectModel(CommentDto.name) private commentModel: Model<CommentDto>) {
        super(commentModel);

    }
}