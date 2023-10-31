import { Injectable } from "@nestjs/common";
import { CrudService, TakeResult } from "../../Common/Services/crudService";
import { CreateUserDto } from "./UsersRepo/Dtos/CreateUserDto";
import { UserDocument, UserDto } from "./UsersRepo/Schema/user.schema";
import { UsersRepoService } from "./UsersRepo/usersRepo.service";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { MongooseFindUnit, MongooseRepoFindPattern_OR } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";

@Injectable()
export class UserService extends CrudService<CreateUserDto, UserDto, UserDocument, UsersRepoService>{
    constructor(private usersRepo: UsersRepoService) {
        super(usersRepo);
    }

    public async TakeByLoginOrEmail(
        sortBy: keyof (UserDto) = "createdAt",
        sortDirection: "asc" | "desc" = "desc", 
        loginValue?: string, 
        emailValue?: string, 
        skip: number = 0, 
        limit: number = 10)
        : Promise<ServiceExecutionResult<ServiceExecutionResultStatus, TakeResult<ServiceDto<UserDto>>>> {

        let loginFindUnit: MongooseFindUnit<UserDto> = loginValue ? { field: "login", value: loginValue } : undefined;
        let emailFindUnit: MongooseFindUnit<UserDto> = emailValue ? { field: "email", value: emailValue } : undefined;

        let findPattern = new MongooseRepoFindPattern_OR(loginFindUnit, emailFindUnit);

        let countUsers = await this.usersRepo.CountByPattern(findPattern);
        let foundUsers = await this.usersRepo.FindByPatterns(findPattern, sortBy, sortDirection, skip, limit);
        let formatedUsers = foundUsers.map(dbUser => this.RemoveAccessInfo(dbUser)) as ServiceDto<UserDto>[];

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, { count: countUsers, items: formatedUsers });
    }


    private RemoveAccessInfo(dbUser: UserDocument): ServiceDto<UserDto> {
        //Remove hash etc
        let user = dbUser.toObject() as ServiceDto<UserDto>;
        let { ...availableInfo } = user;

        return availableInfo;
    }

}