import { Module } from "@nestjs/common"
import { CommentRepoModule } from "./CommentsRepo/commentRepo.module";
import { CommentService } from "./comments.service";
@Module({
    imports: [CommentRepoModule],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentModule { }