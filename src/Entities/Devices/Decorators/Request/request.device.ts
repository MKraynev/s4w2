import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { CreateDeviceDto } from "../../Repo/Dtos/devices.dto.create";
import {Request} from "express";

export const ReadRequestDevice = createParamDecorator(
    async (data: any, ctx: ExecutionContext): Promise<CreateDeviceDto> => {
        let req = ctx.switchToHttp().getRequest() as Request & {rawHeaders: Array<string>};
        console.log(req);
        let userAgentPos = req.rawHeaders.findIndex(header => header === "User-Agent");
        let userAgent = req.rawHeaders[userAgentPos + 1];
        
        let device = new CreateDeviceDto(userAgent || "undefined", req.ip);

        console.log(device);
        return device;
    }
);