import { JwtService } from "@nestjs/jwt";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { EmailService } from "../../Email/email.service";
import { CreateUserDto } from "../Users/UsersRepo/Dtos/CreateUserDto";
import { UserDto } from "../Users/UsersRepo/Schema/user.schema";
import { UserService } from "../Users/users.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private emailService: EmailService,
        private jwtService: JwtService
    ) { }

    public async Registration(userDto: CreateUserDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<UserDto>>> {
        let findUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", userDto.login, userDto.email);
        if (findUser.executionResultObject.items.length !== 0)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.UserAlreadyExist);

        let saveUser = await this.userService.Save(userDto);
        if (saveUser.executionStatus !== ServiceExecutionResultStatus.Success || !saveUser.executionResultObject)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.DataBaseFailed);

        let user = saveUser.executionResultObject;

        this.emailService.SendEmail(
            this.emailService._REGISTRATION_FORM(user.email, user.id, "localhost:5001/auth/login")
        );

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, this.DeletePriveInfo(user));
    }

    public async Login(emailOrLogin: string, password: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, { accessToken: string }>> {
        let foundUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", emailOrLogin, emailOrLogin);

        if (foundUser.executionResultObject.count !== 1)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let payLoad = { id: foundUser.executionResultObject.items[0].id }
        let token = { accessToken: await this.jwtService.signAsync(payLoad) }

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, token)
    }

    private DeletePriveInfo(userDto: ServiceDto<UserDto>) {
        let { ...rest } = userDto;

        return rest;
    }
}