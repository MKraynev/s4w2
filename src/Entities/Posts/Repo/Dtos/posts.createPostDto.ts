import { IsString, MaxLength } from "class-validator";
import { Blogs_CreatePostDto } from "../../../Blogs/Entities/blogs.createPostDto";

export class Post_CreatePostDto extends Blogs_CreatePostDto{
    @IsString()
    public blogId: string;
}