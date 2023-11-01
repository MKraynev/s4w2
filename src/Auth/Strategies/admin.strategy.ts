import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy } from "passport-http"
import { ADMIN_LOGIN, ADMIN_PASSWORD } from "../../settings";

@Injectable()
export class AdminStrategy extends PassportStrategy(BasicStrategy) {
    constructor() {
        super();
    }

    public validate(userName: string, password: string): boolean {
        if (ADMIN_LOGIN === userName && ADMIN_PASSWORD === password)
            return true;

        throw new UnauthorizedException();
    }
}