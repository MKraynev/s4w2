import { IsJWT, MinLength } from "class-validator";

export class ConfirmWithCodeDto{
    @MinLength(10)
    @IsJWT()
    public code: string;
}