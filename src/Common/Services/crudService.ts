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

    public async TakeByIdDto(id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityDocument>>> {
        let findDocument = await this.TakeByIdDocument(id);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, findDocument.executionResultObject.toObject()) 
    }

    public async TakeByIdDocument(id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, EntityDocument>>{
        let item = await this.repo.FindById(id);
        if (item)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, item)

        return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)
    }

    public async UpdateDto(id: string, dto: CreateAndUpdateEntityDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>>{
        let findDocument = await this.repo.FindById(id);
            if(!findDocument){
                return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)
            }
        
        Object.assign(findDocument, dto);

        let updatedObject = (await this.repo.Update(findDocument)).toObject() as ServiceDto<EntityType>;

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, updatedObject);
    }

    public async UpdateDocument(updatedObject: EntityDocument): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let savedBlog = await this.repo.SaveDocument(updatedObject);
        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, savedBlog.toObject())
    }

    public async Delete(id: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let deleteBlog = await this.repo.DeleteById(id)

        if (deleteBlog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, deleteBlog.toObject());

        return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);
    }

    public async Save(entity: CreateAndUpdateEntityDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<EntityType>>> {
        let savedEntity = await this.repo.SaveDto(entity);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, savedEntity.toObject())
    }

    protected async Count(key: keyof (EntityType), value: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, number>> {
        let countRes = await this.repo.Count(key, value);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, countRes)
    }
}