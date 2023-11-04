import { MaxLength } from "class-validator";

export class CreatePostDto {
    @MaxLength(30)
    public title: string;

    @MaxLength(100)
    public shortDescription: string;

    @MaxLength(1000)
    public content: string;
}