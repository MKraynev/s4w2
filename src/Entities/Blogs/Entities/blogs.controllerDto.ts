import { BlogDto } from "../BlogsRepo/Schema/blog.schema";
import { ServiceDto } from "../../../Common/Services/Types/ServiceDto";

export class ControllerBlogDto {
    public id: string;
    public name: string;
    public description: string;
    public websiteUrl: string;
    public createdAt: Date;
    public isMembership: boolean;
    constructor(serviceBLog: ServiceDto<BlogDto>) {
        this.id = serviceBLog.id;
        this.name = serviceBLog.name;
        this.description = serviceBLog.description;
        this.websiteUrl = serviceBLog.websiteUrl;
        this.createdAt = serviceBLog.createdAt;
        this.isMembership = serviceBLog.isMembership;
    }
}