import { Module } from "@nestjs/common";
import { UsersRepoModule } from "./UsersRepo/usersRepo.module";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";


@Module({
    imports: [UsersRepoModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})

export class UsersModule { }