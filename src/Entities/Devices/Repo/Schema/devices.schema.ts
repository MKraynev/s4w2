import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUserDto } from "../Dtos/devices.dto.create";

export type UserDocument = HydratedDocument<UserDto>

@Schema({
    timestamps: true,
    toObject: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
})
export class UserDto {
    @Prop({ required: true })
    login: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    salt: string;

    @Prop({ required: true })
    hash: string;

    @Prop({default: false})
    emailConfirmed: boolean;

    @Prop()
    refreshPasswordTime: string

    @Prop()
    currentRefreshTime: Date;

    createdAt: Date;

    updatedAt: Date;

    constructor(createDto: CreateUserDto, salt: string, hash: string, confirmed: boolean = false) {
        this.login = createDto.login;
        this.email = createDto.email;
        this.salt = salt;
        this.hash = hash;
        this.emailConfirmed = confirmed;
    }
}

export const UserSchema = SchemaFactory.createForClass(UserDto);