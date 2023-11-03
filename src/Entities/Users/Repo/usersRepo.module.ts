import { MongooseModule } from "@nestjs/mongoose";
import { UserDto, UserSchema } from "./Schema/user.schema";
import { UsersRepoService } from "./usersRepo.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [MongooseModule.forFeature([{ name: UserDto.name, schema: UserSchema }])],
    providers: [UsersRepoService],
    exports: [UsersRepoService]
})
export class UsersRepoModule { }