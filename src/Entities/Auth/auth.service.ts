import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { EmailService } from "../../Email/email.service";
import { CreateUserDto } from "../Users/UsersRepo/Dtos/CreateUserDto";
import { UserDto } from "../Users/UsersRepo/Schema/user.schema";
import { UserService } from "../Users/users.service";

export class AuthService {
    constructor(
        private userService: UserService,
        private emailService: EmailService
    ) { }

    public async Registration(userDto: CreateUserDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<UserDto>>> {
        let findUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", userDto.login, userDto.email);
        if (findUser.executionResultObject.items.length >= 1)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.UserAlreadyExist);

        let saveUser = await this.userService.Save(userDto);
        if (saveUser.executionStatus !== ServiceExecutionResultStatus.Success || !saveUser.executionResultObject)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.DataBaseFailed);

        let user = saveUser.executionResultObject;

        this.emailService.SendEmail(user.email, EmailService._REGISTRATION_FORM(user.id));
    }
}