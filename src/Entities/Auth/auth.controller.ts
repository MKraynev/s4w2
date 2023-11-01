import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../Users/UsersRepo/Dtos/CreateUserDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { JwtAuthGuard } from "../../Auth/Guards/jwt-auth.guard";



@Controller('auth')
export class AuthController {
    constructor(private authServise: AuthService) { }

    //post -> /hometask_14/api/auth/password-recovery

    //post -> /hometask_14/api/auth/new-password

    //post -> /hometask_14/api/auth/login
    @Post('login')
    async Login(@Body() userDto: { login: string, password: string }) {
        let login = await this.authServise.Login(userDto.login, userDto.password)

        return login.executionResultObject;
    }


    //post -> /hometask_14/api/auth/refresh-token

    //post -> /hometask_14/api/auth/registration-confirmation
    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async ConfrimEmail(@Query('code') code: string) {
        let confirmEmail = await this.authServise.ConfrimEmail(code);

        switch (confirmEmail.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;

            default:
            case ServiceExecutionResultStatus.UserAlreadyExist:
                throw new BadRequestException();
                break;
        }
    }


    //post -> /hometask_14/api/auth/registration
    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async Registratior(
        @Body() userDto: CreateUserDto
    ) {
        let saveUser = await this.authServise.Registration(userDto);

        switch (saveUser.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;

            default:
            case ServiceExecutionResultStatus.UserAlreadyExist:
                throw new BadRequestException()
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async GetDemo(@Request() req) {
        return req.user;
    }

    //post -> /hometask_14/api/auth/registration-email-resending

    //post -> /hometask_14/api/auth/logout

    //get -> /hometask_14/api/auth/me
}