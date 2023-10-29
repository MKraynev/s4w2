import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CreateCommentDto } from "../Dto/CreateCommentDto";
import { CommentTarget } from "../Dto/CommentTarget";
import { HydratedDocument } from "mongoose";

export type CommentDocument = HydratedDocument<CommentDto>

@Schema({
    timestamps: true,
    toObject: {
        transform(doc, obj) {
            obj.id = obj._id;
            delete obj._id;
            delete obj.__v;
        }
    }
})
export class CommentDto extends CreateCommentDto {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    target: CommentTarget;

    @Prop({ required: true })
    content: string;

    createdAt: Date;

    updatedAt: Date;

    constructor(userId: string, data: CreateCommentDto) {
        super(data.content, data.target)
        this.userId = userId;
    }
}

export const CommentSchema = SchemaFactory.createForClass(CommentDto)