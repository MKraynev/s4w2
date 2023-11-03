import { IsUrl, MaxLength } from "class-validator";

export class CreateBlogDto {
    @MaxLength(15)
    public name: string;

    @MaxLength(500)
    public description: string;

    @MaxLength(100)
    @IsUrl()
    public websiteUrl: string;
}