import { IsEmail, MaxLength, MinLength } from "class-validator";

export class CreateDeviceDto {
    //TODO Начал реализацию сущности девайс
    @MinLength(3)
    @MaxLength(10)
    public name: string;

    @IsEmail()
    public email: string;

    @MinLength(6)
    @MaxLength(20)
    public password: string;
}