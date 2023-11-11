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
import { CONFIRM_REGISTRATION_URL, REFRESH_PASSWORD_URL, REFRESH_TOKEN_EXPIRE } from "../../settings";
import { TokenLoad_confirmEmail } from "../../Auth/Tokens/token.confirmEmail.data";
import { TokenLoad_PasswordRecovery } from "../../Auth/Tokens/token.passwordRecovery.data";
import { SignOptions } from "jsonwebtoken"
import { TokenLoad_Access } from "../../Auth/Tokens/token.access.data";
import { UserData } from "./Dto/auth.userData";
import { RefreshTokenData } from "../../Auth/Tokens/token.refresh.data";
import { AccessToken } from "../../Auth/Tokens/token.access.entity";
import { RefreshToken } from "../../Auth/Tokens/token.refresh.entity";
import { LoginTokens } from "./Dto/auth.tokens";

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

    public async Login(emailOrLogin: string, password: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, LoginTokens>> {
        let foundUser = await this.userService.TakeByLoginOrEmail("createdAt", "desc", emailOrLogin, emailOrLogin, 0, 1);

        if (foundUser.executionResultObject.count !== 1)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let user = foundUser.executionResultObject.items[0] as ServiceDto<UserDto>;


        let currentHash = await bcrypt.hash(password, user.salt);
        if (currentHash !== user.hash)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        let tokensData = await this.MakeTokens(user);
        let result: LoginTokens = {
            accessToken: tokensData.accessToken,
            refreshToken: tokensData.refreshToken
        }

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, result);
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

    public async GetPersonalData(userId: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, UserData>> {
        let findUser = await this.userService.TakeByIdDto(userId);
        if (findUser.executionStatus !== ServiceExecutionResultStatus.Success)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let user = findUser.executionResultObject;

        let userData: UserData = {
            email: user.email,
            login: user.login,
            userId: user.id
        }

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, userData);
    }

    public async RefreshTokens(refreshToken: RefreshTokenData): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, LoginTokens>> {
        let findUser = await this.userService.TakeByIdDocument(refreshToken.id);
        if (findUser.executionStatus !== ServiceExecutionResultStatus.Success)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);
        let user = findUser.executionResultObject as UserDocument;

        if (user.currentRefreshTime !== refreshToken.time)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotRelevant)

        let newTokens = await this.MakeTokens(user.toObject())

        user.currentRefreshTime = newTokens.refreshTokenData.time;

        this.userService.UpdateDocument(user);

        let result: LoginTokens = {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        }

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, result);
    }

    private DeletePriveInfo(userDto: ServiceDto<UserDto>): User {
        let { salt, hash, refreshPasswordTime, updatedAt, emailConfirmed, ...rest } = userDto;

        return rest;
    }

    private async MakeTokens(user: ServiceDto<UserDto>) {
        let RefreshJwtOption: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRE }

        let accessTokenData: TokenLoad_Access = {
            id: user.id,
            name: user.login
        }

        let refreshTokenData: RefreshTokenData = {
            id: user.id,
            name: user.login,
            time: new Date()
        }

        let accessTokenCode = await this.jwtService.signAsync(accessTokenData);
        let accessToken: AccessToken = { accessToken: accessTokenCode }

        let refreshTokenCode = await this.jwtService.signAsync(refreshTokenData, RefreshJwtOption);
        let refreshToken: RefreshToken = { refreshToken: refreshTokenCode }


        let result = {
            accessToken: accessToken,
            accessTokenData: accessTokenData,
            refreshToken: refreshToken,
            refreshTokenData: refreshTokenData
        }

        return result;
    }
}