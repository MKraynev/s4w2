import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../Users/UsersRepo/Dtos/CreateUserDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";

@Controller('auth')
export class AuthController {
    constructor(private authServise: AuthService) { }

    //post -> /hometask_14/api/auth/password-recovery

    //post -> /hometask_14/api/auth/new-password

    //post -> /hometask_14/api/auth/login

    //post -> /hometask_14/api/auth/refresh-token

    //post -> /hometask_14/api/auth/registration-confirmation

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

    //post -> /hometask_14/api/auth/registration-email-resending

    //post -> /hometask_14/api/auth/logout

    //get -> /hometask_14/api/auth/me
}