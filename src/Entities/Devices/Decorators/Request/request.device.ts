// import { ExecutionContext, createParamDecorator } from "@nestjs/common";
// import { CreateDeviceDto } from "../../Repo/Dtos/devices.dto.create";
// import {Request} from "express";

// export const ReadRequestDevice = createParamDecorator(
//     async (data: any, ctx: ExecutionContext): Promise<CreateDeviceDto> => {
//         let req = ctx.switchToHttp().getRequest() as Request & {rawHeaders: Array<string>};

//         let userAgentPos = req.rawHeaders.findIndex(header => header === "User-Agent");
//         let userAgent = req.rawHeaders[userAgentPos + 1];
        
//         let device = new CreateDeviceDto(userAgent || "undefined", req.ip);

//         return device;
//     }
// );

import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { CreateDeviceDto } from "../../Repo/Dtos/devices.dto.create";
import { Request } from "express";

export const ReadRequestDevice = createParamDecorator(
  async (data: any, ctx: ExecutionContext): Promise<CreateDeviceDto> => {
    const req = ctx.switchToHttp().getRequest() as Request & {
      rawHeaders: Array<string>;
    };

    // Check if the request is coming through a proxy
    const forwardedForHeader = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    const clientIp = forwardedForHeader
      ? String(forwardedForHeader).split(',')[0].trim()
      : req.ip;

    const userAgentPos = req.rawHeaders.findIndex((header) => header === "User-Agent");
    const userAgent = req.rawHeaders[userAgentPos + 1];

    const device = new CreateDeviceDto(userAgent || "undefined", clientIp);
    
    return device;
  }
);