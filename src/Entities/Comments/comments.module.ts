import { Module } from "@nestjs/common"
import { CommentRepoModule } from "./Repo/commentRepo.module";
import { CommentService } from "./comments.service";
@Module({
    imports: [CommentRepoModule],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentModule { }