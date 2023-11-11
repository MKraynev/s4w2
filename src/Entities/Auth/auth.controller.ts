import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, Query, UnauthorizedException, Res, NotFoundException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../Users/Repo/Dtos/CreateUserDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { Response } from "express";
import { LoginDto } from "./Dto/auth.login";
import { ValidationPipe } from "../../Pipes/validation.pipe";
import { ConfrimWithEmailDto } from "./Dto/auth.confirmWithEmail";
import { NewPasswordDto } from "./Dto/auth.newPasword";
import { ConfirmWithCodeDto } from "./Dto/auth.confirmWithCode";
import { JwtAuthGuard } from "../../Auth/Guards/jwt-auth.guard";
import { ReadAccessToken } from "../../Auth/Decorators/request.accessToken";
import { ReadRefreshToken } from "../../Auth/Decorators/request.refreshToken";
import { RefreshTokenData } from "../../Auth/Tokens/token.refresh.data";
import { TokenLoad_Access } from "../../Auth/Tokens/token.access.data";


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
    async Login(
        @Body(new ValidationPipe()) userDto: LoginDto,
        @Res({ passthrough: true }) response: Response) {
        let login = await this.authServise.Login(userDto.loginOrEmail, userDto.password)

        switch (login.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let result = login.executionResultObject;

                response.cookie("refreshToken", result.refreshToken, { httpOnly: true, secure: true })
                response.status(200).send(result.accessToken)
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new UnauthorizedException();
                break;
        }
    }


    //post -> /hometask_14/api/auth/refresh-token

    public async RefreshToken(
        @ReadRefreshToken() token: RefreshTokenData,
        @Res({ passthrough: true }) response: Response
    ) {
        let getRefreshTokens = await this.authServise.RefreshTokens(token);

        switch (getRefreshTokens.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let result = getRefreshTokens.executionResultObject;

                response.cookie("refreshToken", result.refreshToken.refreshToken, { httpOnly: true, secure: true })
                response.status(200).send(result.accessToken)
                break;

            default:
            case ServiceExecutionResultStatus.NotRelevant:
            case ServiceExecutionResultStatus.NotFound:
                throw new UnauthorizedException();
                break;
        }
    }

    //post -> /hometask_14/api/auth/registration-confirmation
    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async ConfrimEmail(@Body(new ValidationPipe()) codeDto: ConfirmWithCodeDto) {
        let confirmEmail = await this.authServise.ConfrimEmail(codeDto.code);

        switch (confirmEmail.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
            case ServiceExecutionResultStatus.EmailAlreadyExist:
                throw new BadRequestException({ errorsMessages: [{ message: "Wrong code", field: "code" }] })
                break;
        }
    }

    //post -> /hometask_14/api/auth/registration
    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async Registration(
        @Body(new ValidationPipe()) userDto: CreateUserDto
    ) {
        let saveUser = await this.authServise.Registration(userDto);

        switch (saveUser.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;

            case ServiceExecutionResultStatus.EmailAlreadyExist:
                throw new BadRequestException({ errorsMessages: [{ message: "Email already exist", field: "email" }] })
                break;

            default:
            case ServiceExecutionResultStatus.LoginAlreadyExist:
                throw new BadRequestException({ errorsMessages: [{ message: "Login already exist", field: "login" }] })
                break;
        }
    }

    //post -> /hometask_14/api/auth/registration-email-resending
    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async ResendingEmail(@Body(new ValidationPipe()) userDto: ConfrimWithEmailDto) {
        let resendEmail = await this.authServise.EmailResending(userDto.email);

        switch (resendEmail.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.UserAlreadyConfirmed:
            case ServiceExecutionResultStatus.NotFound:
                throw new BadRequestException({ errorsMessages: [{ message: "Wrong email", field: "email" }] })
                break;

        }
    }


    //post -> /hometask_14/api/auth/logout

    //get -> /hometask_14/api/auth/me
    @Get('me')
    @UseGuards(JwtAuthGuard)
    public async GetPersonalData(@ReadAccessToken() tokenLoad: TokenLoad_Access) {
        let findUserData = await this.authServise.GetPersonalData(tokenLoad.id)

        switch (findUserData.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return findUserData.executionResultObject;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }
}