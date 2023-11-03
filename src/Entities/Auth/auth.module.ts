import { Module } from "@nestjs/common";
import { UsersModule } from "../Users/users.module";
import { PassportModule } from "@nestjs/passport";
import { EmailModule } from "../../Email/email.module";
import { JwtModule } from "@nestjs/jwt";
import { ACCESS_TOKEN_EXPIRE, JWT_SECRET } from "../../settings";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "../../Auth/Strategies/jwt.strategy";
import { UsersRepoModule } from "../Users/Repo/usersRepo.module";
import { UserService } from "../Users/users.service";

@Module({
  imports: [
    UsersRepoModule,
    PassportModule,
    EmailModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_EXPIRE },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserService],
  exports: [AuthService],
})
export class AuthModule {}

//AdminStrategy