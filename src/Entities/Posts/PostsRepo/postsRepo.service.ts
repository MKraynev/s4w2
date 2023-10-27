import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../Repos/Mongoose/MongooseRepo";
import { PostDto, PostDocument } from "./Schema/post.schema";
import { CreatePostDto } from "./Dtos/CreatePostDto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class PostsRepoService extends MongooseRepo<PostDto,CreatePostDto ,PostDocument> {
  constructor(@InjectModel(PostDto.name) private blogModel: Model<PostDto>) { 
    super(blogModel)
  }
}