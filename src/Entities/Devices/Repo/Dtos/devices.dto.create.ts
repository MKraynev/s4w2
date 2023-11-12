import { IsIP, MaxLength, MinLength } from "class-validator";

export class CreateDeviceDto {
    //TODO Начал реализацию сущности девайс
    @MinLength(2)
    @MaxLength(40)
    public name: string;

    @IsIP()
    public ip: string;

    constructor(name: string, ip: string) {
        this.name = name;
        this.ip = ip;
    }
}