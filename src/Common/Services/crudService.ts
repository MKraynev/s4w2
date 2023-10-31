import { HydratedDocument } from "mongoose";
import { MongooseRepo } from "../../Repos/Mongoose/MongooseRepo";
import { ServiceExecutionResult } from "./Types/ServiseExecutionResult";
import { ServiceExecutionResultStatus } from "./Types/ServiceExecutionStatus";
import { ServiceDto } from "./Types/ServiceDto";

export type TakeResult<T> = {
    count: number,
    items: Array<T>
}

export class CrudService<
    CreateAndUpdateEntityDto,
    EntityType extends CreateAndUpdateEntityDto,
    EntityDocument extends HydratedDocument<EntityType>,
    Repo extends MongooseRepo<EntityType, CreateAndUpdateEntityDto, EntityDocument>>
{
    constructor(private repo: Repo) { }

    public async Take(sortBy: keyof (EntityType), sortDirection: "asc" | "desc", searchBy?: keyof (EntityType), searchValue?: string, skip: number = 0, limit: number = 10)
        : Promise<ServiceExecutionResult<ServiceExecutionResultStatus, TakeResult<ServiceDto<EntityType>>>> {

        let count = await this.repo.Count(searchBy, searchValue);
        skip = count > skip ? skip : 0;

        let items = await this.repo.Find(sortBy, sortDirection, searchBy, searchValue, skip, limit);

        let formatedItems = items.map(item => item.toObject()) as ServiceDto<EntityType>[];

        let result = {
            count: count,
            items: formatedItems
        }
        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, result)
    }

    public async TakeById(id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let item = await this.repo.FindById(id);
        if (item)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, item.toObject())

        return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)
    }

    public async Update(id: string, newEntityData: CreateAndUpdateEntityDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let blog = await this.repo.FindById(id);

        if (!blog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        Object.assign(blog, newEntityData);

        let savedBlog = await this.repo.Save(blog);
        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, savedBlog.toObject())
    }

    public async Delete(id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let deleteBlog = await this.repo.DeleteById(id)

        if (deleteBlog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, deleteBlog.toObject());

        return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);
    }

    public async Save(entity: CreateAndUpdateEntityDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let savedEntity = await this.repo.Save(entity);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, savedEntity.toObject())
    }

    protected async Count(key: keyof (EntityType), value: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, number>> {
        let countRes = await this.repo.Count(key, value);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, countRes)
    }
}