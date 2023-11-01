import { JwtService } from "@nestjs/jwt";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { EmailService } from "../../Email/email.service";
import { CreateUserDto } from "../Users/UsersRepo/Dtos/CreateUserDto";
import { UserDto } from "../Users/UsersRepo/Schema/user.schema";
import { UserService } from "../Users/users.service";
import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt"
import { REGISTRATION_URL } from "../../settings";
import { LoadToken_confirmEmail } from "../../Auth/Tokens/tokenLoad.confirmEmail";

@Injectable()
export class AuthService {
    constructor(
        public userService: UserService,
        private emailService: EmailService,
        private jwtService: JwtService
    ) { }

    public async Registration(userDto: CreateUserDto, confirmed: boolean = false): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<UserDto>>> {
        //1) stop if user exist
        let findUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", userDto.login, userDto.email);
        if (findUser.executionResultObject.items.length !== 0)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.UserAlreadyExist);

        //2) Generate salt/hash
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(userDto.password, salt);

        let newUser = new UserDto(userDto, salt, hash);

        let saveUser = await this.userService.Save(newUser);
        if (saveUser.executionStatus !== ServiceExecutionResultStatus.Success || !saveUser.executionResultObject)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.DataBaseFailed);

        let user = saveUser.executionResultObject;

        let tokenLoad: LoadToken_confirmEmail = { id: user.id }
        let token = await this.jwtService.signAsync(tokenLoad);

        if (!confirmed)
            this.emailService.SendEmail(
                this.emailService._CONFIRM_EMAIL_FORM(user.email, token, REGISTRATION_URL)
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

    public async ConfrimEmail(token: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<UserDto>>> {
        let tokenLoad: LoadToken_confirmEmail = await this.jwtService.verifyAsync(token);

        let findUser = await this.userService.TakeByIdDocument(tokenLoad.id);
        let userDocument = findUser.executionResultObject;

        if (findUser.executionStatus !== ServiceExecutionResultStatus.Success || !findUser.executionResultObject)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        if (userDocument.emailConfirmed)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.UserAlreadyExist);

        userDocument.emailConfirmed = true;

        let updatedUser = (await this.userService.UpdateDocument(userDocument)).executionResultObject;

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, updatedUser)
    }

    private DeletePriveInfo(userDto: ServiceDto<UserDto>) {
        let { ...rest } = userDto;

        return rest;
    }


}