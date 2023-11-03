import { HydratedDocument } from "mongoose";
import { AvailableLikeStatus, CreateLikeDto } from "../Dtos/createLikeDto";
import { Prop, Schema } from "@nestjs/mongoose";

export type LikeDocument = HydratedDocument<LikeDto>;

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
export class LikeDto extends CreateLikeDto {
    @Prop({required: true})
    userId: string;
    @Prop({required: true})
    userLogin: string;

    @Prop({required: true})
    targetId: string;

    @Prop()
    status: AvailableLikeStatus

    createdAt: Date;

    updatedAt: Date;
}