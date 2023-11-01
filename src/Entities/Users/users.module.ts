import { Module } from "@nestjs/common";
import { UserController } from "./users.controller";
import { AuthModule } from "../Auth/auth.module";


@Module({
    imports: [AuthModule],
    controllers: [UserController],
    providers: [],
    exports: []
})

export class UsersModule { }