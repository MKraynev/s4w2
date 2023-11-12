export class CreateDeviceDto {
    public name: string;

    public ip: string;

    constructor(name: string, ip: string) {
        this.name = name;
        this.ip = ip;
    }
}