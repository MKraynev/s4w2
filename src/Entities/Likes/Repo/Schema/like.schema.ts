import { HydratedDocument } from "mongoose";
import { AvailableLikeStatus, AvailableLikeStatusArray, CreateLikeWithIdDto } from "../Dtos/createLikeDto";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LikeTarget } from "../Dtos/likes.target";

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
export class LikeDto extends CreateLikeWithIdDto {
    @Prop({required: true})
    userId: string;
    @Prop({required: true})
    userLogin: string;

    @Prop({ required: true, type: String })
    target: LikeTarget;


    @Prop({required: true})
    targetId: string;

    @Prop({ type: String, enum: AvailableLikeStatusArray })
    likeStatus: AvailableLikeStatus

    createdAt: Date;

    updatedAt: Date;

    constructor(likeData: CreateLikeWithIdDto) {
        super(likeData.userId, likeData.userLogin, likeData.target, likeData.targetId, likeData)
    }
}

export const LikeSchema = SchemaFactory.createForClass(LikeDto);