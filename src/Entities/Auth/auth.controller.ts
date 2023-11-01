import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../Users/UsersRepo/Dtos/CreateUserDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { JwtAuthGuard } from "../../Auth/Guards/jwt-auth.guard";
import { LoginDto } from "./Dto/auth.login";
import { ValidationPipe } from "../../Pipes/validation.pipe";
import { IsString } from "class-validator";
import { ConfrimWithEmailDto } from "./Dto/auth.confirmWithEmail";
import { NewPasswordDto } from "./Dto/auth.newPasword";



@Controller('auth')
export class AuthController {
    constructor(private authServise: AuthService) { }

    //post -> /hometask_14/api/auth/password-recovery
    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async PasswordRecovery(@Body(new ValidationPipe()) userDto: ConfrimWithEmailDto) {
        let startRecoveryPassword = await this.authServise.RestorePasswordBegin(userDto.email);

        switch (startRecoveryPassword.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                return;
                break;
        }
    }

    //post -> /hometask_14/api/auth/new-password
    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async SaveNewUserPassword(@Body(new ValidationPipe()) newPassDto: NewPasswordDto) {
        let saveNewPassword = await this.authServise.RestorePasswordEnd(newPassDto.newPassword, newPassDto.recoveryCode)

        switch (saveNewPassword.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotRelevantCode:
            case ServiceExecutionResultStatus.NotFound:
            case ServiceExecutionResultStatus.WrongPassword:
                throw new BadRequestException();
                break;
        }
    }


    //post -> /hometask_14/api/auth/login
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async Login(@Body(new ValidationPipe()) userDto: LoginDto) {
        let login = await this.authServise.Login(userDto.loginOrEmail, userDto.password)

        switch (login.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return login.executionResultObject;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new BadRequestException();
                break;
        }

    }


    //post -> /hometask_14/api/auth/refresh-token

    //post -> /hometask_14/api/auth/registration-confirmation
    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async ConfrimEmail(@Query('code') code: string) {
        if (!code)
            throw new BadRequestException();

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
        @Body(new ValidationPipe()) userDto: CreateUserDto
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