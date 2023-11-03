import { IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateBlogDto {
    @MinLength(3)
    @MaxLength(15)
    public name: string;

    @MaxLength(500)
    public description: string;

    @MaxLength(100)
    @IsUrl()
    public websiteUrl: string;
}