import { JwtService } from "@nestjs/jwt";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { EmailService } from "../../Email/email.service";
import { CreateUserDto } from "../Users/Repo/Dtos/CreateUserDto";
import { UserDocument, UserDto } from "../Users/Repo/Schema/user.schema";
import { UserService } from "../Users/users.service";
import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt"
import { CONFIRM_REGISTRATION_URL, REFRESH_PASSWORD_URL } from "../../settings";
import { TokenLoad_confirmEmail } from "../../Auth/Tokens/tokenLoad.confirmEmail";
import { TokenLoad_PasswordRecovery } from "../../Auth/Tokens/tokenLoad.passwordRecovery";
import { SignOptions } from "jsonwebtoken"
import { TokenLoad_Access } from "../../Auth/Tokens/tokenLoad.access";

export type User = { login: string; email: string; createdAt: Date; id: string };

@Injectable()
export class AuthService {
    constructor(
        public userService: UserService,
        private emailService: EmailService,
        private jwtService: JwtService
    ) { }

    public async Registration(userDto: CreateUserDto, confirmed: boolean = false)
        : Promise<ServiceExecutionResult<ServiceExecutionResultStatus, User>> {

        //1) stop if user exist
        let findUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", userDto.login, userDto.email);

        if (findUser.executionResultObject.items.length !== 0) {
            let user = findUser.executionResultObject.items[0];

            let status = user.login === userDto.login ? ServiceExecutionResultStatus.LoginAlreadyExist : ServiceExecutionResultStatus.EmailAlreadyExist

            return new ServiceExecutionResult(status);
        }

        //2) Generate salt/hash
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(userDto.password, salt);

        let newUser = new UserDto(userDto, salt, hash);

        let saveUser = await this.userService.Save(newUser);
        if (saveUser.executionStatus !== ServiceExecutionResultStatus.Success || !saveUser.executionResultObject)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.DataBaseFailed);

        let user = saveUser.executionResultObject;

        let tokenLoad: TokenLoad_confirmEmail = { id: user.id }
        let token = await this.jwtService.signAsync(tokenLoad);

        if (!confirmed)
            this.emailService.SendEmail(
                this.emailService._CONFIRM_EMAIL_FORM(user.email, token, CONFIRM_REGISTRATION_URL)
            );

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, this.DeletePriveInfo(user));
    }

    public async EmailResending(userEmail: string) {
        let findUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", undefined, userEmail);
        let user = findUser.executionResultObject.items[0] as ServiceDto<UserDto>;

        if (findUser.executionResultObject.items.length !== 1)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        if (user.emailConfirmed)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.UserAlreadyConfirmed);


        let tokenLoad: TokenLoad_confirmEmail = { id: user.id }
        let token = await this.jwtService.signAsync(tokenLoad);


        this.emailService.SendEmail(this.emailService._CONFIRM_EMAIL_FORM(user.email, token, CONFIRM_REGISTRATION_URL));

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, this.DeletePriveInfo(user));

    }

    public async Login(emailOrLogin: string, password: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, { accessToken: string, refreshToken: string }>> {
        let foundUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", emailOrLogin, emailOrLogin, 0, 1);

        if (foundUser.executionResultObject.count !== 1)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let user = foundUser.executionResultObject.items[0];


        let currentHash = await bcrypt.hash(password, user.salt);
        if (currentHash !== user.hash)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let RefreshJwtOption: SignOptions = { expiresIn: "5m" }

        let payLoad: TokenLoad_Access = {
            id: foundUser.executionResultObject.items[0].id,
            name: foundUser.executionResultObject.items[0].login
        }
        
        let accessToken = await this.jwtService.signAsync(payLoad);
        let refreshToken = await this.jwtService.signAsync(payLoad, RefreshJwtOption);

        let result = {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, result)
    }

    public async ConfrimEmail(token: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<UserDto>>> {
        let tokenLoad: TokenLoad_confirmEmail = await this.jwtService.verifyAsync(token);

        let findUser = await this.userService.TakeByIdDocument(tokenLoad.id);
        let userDocument = findUser.executionResultObject;

        if (findUser.executionStatus !== ServiceExecutionResultStatus.Success || !findUser.executionResultObject)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        if (userDocument.emailConfirmed)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.EmailAlreadyExist);

        userDocument.emailConfirmed = true;

        let updatedUser = (await this.userService.UpdateDocument(userDocument)).executionResultObject;

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, updatedUser)
    }

    public async RestorePasswordBegin(userEmail: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, undefined>> {
        let findUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", undefined, userEmail, 0, 1, false);
        if (findUser.executionResultObject.items.length === 0)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let user = findUser.executionResultObject.items[0] as UserDocument;

        let refreshPasswordTime = new Date().toISOString();
        user.refreshPasswordTime = refreshPasswordTime;

        this.userService.UpdateDocument(user);

        let tokenLoad: TokenLoad_PasswordRecovery = { id: user.id, recoveryTime: user.refreshPasswordTime }
        let token = await this.jwtService.signAsync(tokenLoad)

        this.emailService.SendEmail(this.emailService._PASSWORD_RECOVERY_FORM(user.email, token, REFRESH_PASSWORD_URL))

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success);
    }

    public async RestorePasswordEnd(newPassword: string, token: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<UserDto>>> {
        let tokenLoad: TokenLoad_PasswordRecovery = await this.jwtService.verifyAsync(token);
        let findUser = await this.userService.TakeByIdDocument(tokenLoad.id);

        if (findUser.executionStatus === ServiceExecutionResultStatus.NotFound)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let user = findUser.executionResultObject;

        if (user.refreshPasswordTime !== tokenLoad.recoveryTime)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotRelevantCode)

        let newHash = await bcrypt.hash(newPassword, user.salt);

        if (newHash === user.hash)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.WrongPassword)

        let salt = await bcrypt.genSalt(10);
        newHash = await bcrypt.hash(newPassword, salt);

        user.salt = salt;
        user.hash = newHash;
        user.refreshPasswordTime = undefined;

        let saveUser = await this.userService.UpdateDocument(user);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, saveUser.executionResultObject);
    }

    private DeletePriveInfo(userDto: ServiceDto<UserDto>): User {
        let { salt, hash, refreshPasswordTime, updatedAt, emailConfirmed, ...rest } = userDto;

        return rest;
    }


}