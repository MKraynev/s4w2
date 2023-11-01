import { IsEmail } from "class-validator";

export class ConfrimWithEmailDto{
    @IsEmail()
    public email: string
}