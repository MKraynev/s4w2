import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UnauthorizedException } from "@nestjs/common";
import { DeviceService } from "./devices.service";
import { ReadRefreshToken } from "../../Auth/Decorators/request.refreshToken";
import { RefreshTokenData } from "../../Auth/Tokens/token.refresh.data";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";


@Controller('security')
export class DevicesController {
    constructor(private deviceService: DeviceService) { }

    @Get('devices')
    async GetDevices(@ReadRefreshToken() refreshToken: RefreshTokenData) {
        let userDevices = await this.deviceService.GetUserDevices(refreshToken);

        return userDevices;
    }

    @Delete('devices')
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeleteDevices(@ReadRefreshToken() refreshToken: RefreshTokenData) {
        let deleteDevices = await this.deviceService.DisableRestDevices(refreshToken);

        switch (deleteDevices.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;


            default:
                throw new UnauthorizedException();
                break;
        }
    }

    @Delete('devices/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeleteOne(
        @Param('id') id: string,
        @ReadRefreshToken() refreshToken: RefreshTokenData
    ) {
        let deleteDevice = await this.deviceService.DisableOne(id, refreshToken);

        switch (deleteDevice.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
                throw new UnauthorizedException();
                break;
        }
    }
}