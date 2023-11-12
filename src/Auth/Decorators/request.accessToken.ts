import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express"
import { AccessTokenData } from "../Tokens/token.access.data";
import { JwtService } from "@nestjs/jwt";
import { JWT_SECRET } from "../../settings";

export enum TokenExpectation {
    Expected,
    Possibly
}

export const ReadAccessToken = createParamDecorator(
    async (data: TokenExpectation = TokenExpectation.Expected, ctx: ExecutionContext): Promise<AccessTokenData | undefined> => {

        let req = ctx.switchToHttp().getRequest() as (Request & { user: AccessTokenData });
        let tokenLoad: AccessTokenData | undefined = undefined;

        switch (data) {
            case TokenExpectation.Expected:
                tokenLoad = req.user as AccessTokenData;
                break;

            case TokenExpectation.Possibly:
                let headerAuthString = req.header('authorization');

                if (!headerAuthString || !headerAuthString.toLowerCase().startsWith("bearer "))
                    return undefined;

                let tokenValue = headerAuthString.split(" ")[1];
                if (tokenValue) {
                    try {
                        tokenLoad = await (new JwtService({ secret: JWT_SECRET })).verifyAsync(tokenValue) as AccessTokenData;
                    }
                    catch (e) {
                    }
                }
                break;
        }
        return tokenLoad;
    },
);