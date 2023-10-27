import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUserDto } from "../Dtos/CreateUserDto";

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
export class UserDto extends CreateUserDto {
    @Prop({ required: true })
    login: string;

    @Prop({ required: true })
    email: string;

    createdAt: Date;

    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDto);