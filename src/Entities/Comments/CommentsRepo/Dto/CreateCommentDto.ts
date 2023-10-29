import { CommentTarget } from "./CommentTarget";

export class CreateCommentDto {
    constructor(
        public content: string,
        public target: CommentTarget | undefined = undefined
    ) { }
}