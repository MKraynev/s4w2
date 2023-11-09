import { Module } from "@nestjs/common"
import { CommentRepoModule } from "./Repo/commentRepo.module";
import { CommentService } from "./comments.service";
import { PostsRepoModule } from "../Posts/Repo/postsRepo.module";
import { UsersRepoModule } from "../Users/Repo/usersRepo.module";
import { CommentsController } from "./comments.controller";
import { LikesModule } from "../Likes/likes.module";
@Module({
    imports: [CommentRepoModule, UsersRepoModule, PostsRepoModule, LikesModule],
    controllers: [CommentsController],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentsModule { }