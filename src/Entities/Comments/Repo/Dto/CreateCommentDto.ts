import { MaxLength, MinLength } from "class-validator";
import { CommentTarget } from "./CommentTarget";

export class CreateCommentDto {
    @MinLength(20)
    @MaxLength(300)
    public content: string;
}

export class CreateCommentWithTargetAndIdDto extends CreateCommentDto {
    public targetId: string;
    public target: CommentTarget

    constructor(targetId: string, target: CommentTarget, commentDto: CreateCommentDto) {
        super();
        this.targetId = targetId;
        this.target = target;
        this.content = commentDto.content;
    }
}