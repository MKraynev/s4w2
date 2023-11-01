import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    public loginOrEmail: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    public password: string;
}