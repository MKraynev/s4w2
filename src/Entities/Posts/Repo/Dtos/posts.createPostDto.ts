import { IS_LENGTH, IsString, IsUUID, MaxLength } from "class-validator";
import { Blogs_CreatePostDto } from "../../../Blogs/Entities/blogs.createPostDto";
import { IsMongoIdObject } from "../../../../Common/Validators/validator.IsMongoIdObject";

export class Post_CreatePostDto extends Blogs_CreatePostDto{
    @IsMongoIdObject()
    public blogId: string;
}