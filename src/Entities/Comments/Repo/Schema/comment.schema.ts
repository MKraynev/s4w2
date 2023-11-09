import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CreateCommentDto, CreateCommentWithTargetAndIdDto } from "../Dto/CreateCommentDto";
import { CommentTarget } from "../Dto/CommentTarget";
import { HydratedDocument } from "mongoose";
import { DecoratedComment } from "../Dto/comment.decorated";

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
export class CommentDto extends CreateCommentWithTargetAndIdDto {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    userLogin: string;

    @Prop({ required: true, type: String })
    target: CommentTarget;

    @Prop({ required: true })
    targetId: string;

    @Prop({ required: true })
    content: string;

    createdAt: Date;

    updatedAt: Date;

    constructor(userId: string, userLogin: string, data: CreateCommentWithTargetAndIdDto) {
        super(data.targetId, data.target, data)
        this.userId = userId;
        this.userLogin = userLogin;
    }
}

export const CommentSchema = SchemaFactory.createForClass(CommentDto)