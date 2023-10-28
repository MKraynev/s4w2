import { ServiceDto } from "../../../../Common/Services/Types/ServiceDto";
import { ServiceExecutionResultStatus } from "../../../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../../../Common/Services/Types/ServiseExecutionResult";
import { TakeResult } from "../../../../Common/Services/crudService";
import { CreateBlogDto } from "../../BlogsRepo/Dtos/CreateBlogDto";
import { BlogDto } from "../../BlogsRepo/Schema/blog.schema";

let blogs: ServiceDto<BlogDto>[] = [
    { ...new BlogDto("some name", "some description", "some url"), id: "1234567892", isMembership: false, createdAt: new Date() },
    { ...new BlogDto("some name 2", "some description 2", "some url 2"), id: "1234567892", isMembership: false, createdAt: new Date() },
    { ...new BlogDto("some name 3", "some description 3", "some url 3"), id: "1234567893", isMembership: false, createdAt: new Date() },
    { ...new BlogDto("some name 4", "some description 4", "some url 4"), id: "1234567894", isMembership: false, createdAt: new Date() },
    { ...new BlogDto("some name 5", "some description 5", "some url 5"), id: "1234567895", isMembership: false, createdAt: new Date() },
    { ...new BlogDto("some name 6", "some description 6", "some url 6"), id: "1234567896", isMembership: false, createdAt: new Date() },
    { ...new BlogDto("some name 7", "some description 7", "some url 7"), id: "1234567897", isMembership: false, createdAt: new Date() },
];

export const mockBlogService = {
    Take: function (
        sortBy: keyof BlogDto,
        sortDirection: "asc" | "desc",
        searchBy?: keyof BlogDto,
        searchValue?: string,
        skip?: number,
        limit?: number
    ): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, TakeResult<ServiceDto<BlogDto>>>> {
        let takeResult: TakeResult<ServiceDto<BlogDto>> = {
            count: blogs.length,
            items: blogs
        }
        return new Promise((resolve, reject) => {
            resolve(new ServiceExecutionResult(ServiceExecutionResultStatus.Success, takeResult))
        })
    },
    TakeById: function (id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<BlogDto>>> {
        throw new Error("Function not implemented.");
    },
    Update: function (id: string, newEntityData: CreateBlogDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<BlogDto>>> {
        throw new Error("Function not implemented.");
    },
    Delete: function (id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<BlogDto>>> {
        throw new Error("Function not implemented.");
    },
    Save: function (entity: CreateBlogDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<BlogDto>>> {
        throw new Error("Function not implemented.");
    },
    Count: function (key: keyof BlogDto, value: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, number>> {
        throw new Error("Function not implemented.");
    }
}