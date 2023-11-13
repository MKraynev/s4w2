import { ExecutionContext, UnauthorizedException, createParamDecorator } from "@nestjs/common";
import { Request } from "express";
import { RefreshTokenData } from "../Tokens/token.refresh.data";
import { JwtService } from "@nestjs/jwt";
import { JWT_SECRET } from "../../settings";

export const ReadRefreshToken = createParamDecorator(
    async (data: any, ctx: ExecutionContext): Promise<RefreshTokenData> => {

        let req = ctx.switchToHttp().getRequest() as Request;
        let cookieToken = req.cookies['refreshToken'];

        if (!cookieToken)
            throw new UnauthorizedException();

        try {
            let decodedObject = await (new JwtService({ secret: JWT_SECRET })).verify(cookieToken) as RefreshTokenData;
            
            return decodedObject;
        }
        catch (e) { 
            throw new UnauthorizedException();
         }
    }
);