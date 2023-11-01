import { MaxLength, MinLength } from "class-validator"

export class NewPasswordDto {
    @MinLength(6)
    @MaxLength(20)
    public newPassword: string

    @MinLength(10)
    public recoveryCode: string
}