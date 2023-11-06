import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express"
import { TokenLoad_Access } from "../Tokens/tokenLoad.access";
import { JwtService } from "@nestjs/jwt";
import { JWT_SECRET } from "../../settings";

export enum TokenExpectation {
    Expected,
    Possibly
}

export const RequestTokenLoad = createParamDecorator(
    async (data: TokenExpectation = TokenExpectation.Expected, ctx: ExecutionContext): Promise<TokenLoad_Access | undefined> => {
        let query = ctx.getArgs()[0].query;

        let req = ctx.switchToHttp().getRequest() as (Request & { user: TokenLoad_Access });
        let tokenLoad: TokenLoad_Access | undefined = undefined;

        switch (data) {
            case TokenExpectation.Expected:
                tokenLoad = req.user as TokenLoad_Access;
                break;

            case TokenExpectation.Possibly:
                let headerAuthString = req.header('authorization');

                if (!headerAuthString || !headerAuthString.startsWith("bearer "))
                    return undefined;

                let tokenValue = headerAuthString.split(" ")[1];
                if (tokenValue) {
                    tokenLoad = await (new JwtService({ secret: JWT_SECRET })).verifyAsync(tokenValue) as TokenLoad_Access;
                }
                break;

        }
        return tokenLoad;
    },
);