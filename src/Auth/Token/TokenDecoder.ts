import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";
import { Token } from "./Token";

// export const TokenDecoder = createParamDecorator(
//     (data: unknown, ctx: ExecutionContext) => {
//         let req = ctx.switchToHttp().getRequest() as Request;
//         let headerString: string | undefined = req.header("authorization");

//         if (headerString?.toLocaleLowerCase().startsWith("bearer ")) {
//             let tokenString = headerString.split(" ")[1];
//             let token: Token = {
//                 accessToken: tokenString
//             }
            
            
//         }
        
//     },
// );