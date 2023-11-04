import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import {Request} from "express"
import { TokenLoad_Access } from "../Tokens/tokenLoad.access";

export const RequestTokenLoad = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        let query = ctx.getArgs()[0].query;
        let req = ctx.switchToHttp().getRequest() as (Request & {user: TokenLoad_Access});
        let tokenLoad = req.user as TokenLoad_Access;

        return tokenLoad;
    },
);