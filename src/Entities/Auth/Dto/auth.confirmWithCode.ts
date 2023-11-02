import { MinLength } from "class-validator";

export class ConfirmWithCodeDto{
    @MinLength(10)
    public code: string;
}