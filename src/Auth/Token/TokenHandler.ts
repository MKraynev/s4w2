import { JwtService } from "@nestjs/jwt"
import { Token } from "./Token";
import { JwtPayload } from "jsonwebtoken"
import { UnauthorizedException } from "@nestjs/common";


export type TokenLoad = {
    id: string;
    deviceId: string;
}


export class TokenHandler {
    constructor(private jwtService: JwtService) { }

    public async ReadToken(token: Token): Promise<TokenLoad> {
        try {
            let decoded = await this.jwtService.verify(token.accessToken) as JwtPayload;
            if (decoded && decoded.exp) {
                let nowTime: number = new Date().getTime();
                let tokenIsFresh = nowTime <= decoded.exp * 1000;

                if(tokenIsFresh){
                    let dataFromToken: TokenLoad = {
                        id: decoded["id"],
                        deviceId: decoded["deviceId"]
                    }
                    return dataFromToken;
                }
                
            }
            throw new UnauthorizedException();
        }
        catch {
            throw new UnauthorizedException();
        }
    }
}