import { Controller, Delete, Get, HttpCode, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { DeviceService } from "./devices.service";
import { ReadRefreshToken } from "../../Auth/Decorators/request.refreshToken";
import { RefreshTokenData } from "../../Auth/Tokens/token.refresh.data";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";


@Controller('security/devices')
export class DevicesController {
    constructor(private deviceService: DeviceService) { }

    @Get()
    async GetDevices(@ReadRefreshToken() refreshToken: RefreshTokenData) {
        let userDevices = await this.deviceService.GetUserDevices(refreshToken);

        return userDevices;
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeleteDevices(@ReadRefreshToken() refreshToken: RefreshTokenData) {
        let deleteDone = await this.deviceService.DisableRestDevices(refreshToken);


        deleteDone || new UnauthorizedException();
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeleteOne(@ReadRefreshToken() refreshToken: RefreshTokenData) {
        let deleteDevice = await this.deviceService.Delete(refreshToken.device);

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