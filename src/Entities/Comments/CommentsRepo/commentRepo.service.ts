import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../../Common/Repos/Mongoose/MongooseRepo";
import { CommentDocument, CommentDto } from "./Schema/comment.schema";
import { CreateCommentDto } from "./Dto/CreateCommentDto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class CommentRepoService extends MongooseRepo<CommentDto, CreateCommentDto, CommentDocument>{
    constructor(@InjectModel(CommentDto.name) private commentModel: Model<CommentDto>) {
        super(commentModel);

    }
}