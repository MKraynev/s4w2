import { MaxLength, MinLength } from "class-validator";

export class Blogs_CreatePostDto{
    @MaxLength(30)
    @MinLength(1)
    public title: string;

    @MaxLength(100)
    @MinLength(1)
    public shortDescription: string;

    @MaxLength(1000)
    @MinLength(1)
    public content: string;

}