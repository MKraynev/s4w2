import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query } from "@nestjs/common";
import { UserDto } from "./UsersRepo/Schema/user.schema";
import { QueryPaginator } from "../../Common/Routes/QueryParams/PaginatorQueryParams";
import { InputPaginator, OutputPaginator } from "../../Paginator/Paginator";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { CreateUserDto } from "./UsersRepo/Dtos/CreateUserDto";
import { AuthService } from "../Auth/auth.service";

@Controller('users')
export class UserController {
    constructor(private authService: AuthService) {}
    
    @Get()
    async GetUsers(
        @Query('searchLoginTerm') loginTerm: string | undefined,
        @Query('searchEmailTerm') emailTerm: string | undefined,
        @Query('sortBy') sortBy: keyof (UserDto) = "createdAt",
        @Query('sortDirection') sortDirecrion: "desc" | "asc" = "desc",
        @QueryPaginator() paginator: InputPaginator
    ) {
        let findUsers = await this.authService.userService.TakeByLoginOrEmail(sortBy, sortDirecrion, loginTerm, emailTerm, paginator.skipElements, paginator.pageSize);

        switch (findUsers.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let users = findUsers.executionResultObject.items.map(user => {
                    let { updatedAt, emailConfirmed, hash, salt, refreshPasswordTime, ...rest } = user;
                    return rest;
                })
                let count = findUsers.executionResultObject.count;
                let pagedUsers = new OutputPaginator(count, users, paginator);

                return pagedUsers;
                break;

            default:
                throw new NotFoundException();
                break;
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async SaveUser(
        @Body() user: CreateUserDto,
        @Body('password') password: string
    ) {
        
        let saveUser = await this.authService.Registration(user, true);

        switch (saveUser.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let { updatedAt, emailConfirmed, hash, salt, refreshPasswordTime, ...rest } = saveUser.executionResultObject;
                return rest;
                break;

            default:
                throw new BadRequestException();
                break;
        }
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeleteUser(@Param('id') id: string) {
        let deleteUser = await this.authService.userService.Delete(id);

        switch (deleteUser.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }
}