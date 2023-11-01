import { Module } from "@nestjs/common";
import { UserController } from "./users.controller";
import { AuthModule } from "../Auth/auth.module";
import { AdminStrategy } from "../../Auth/Strategies/admin.strategy";


@Module({
    imports: [AuthModule],
    controllers: [UserController],
    providers: [AdminStrategy],
    exports: []
})

export class UsersModule { }