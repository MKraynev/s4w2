import { Module } from "@nestjs/common"
import { CommentRepoModule } from "./Repo/commentRepo.module";
import { CommentService } from "./comments.service";
import { UsersModule } from "../Users/users.module";
import { PostsModule } from "../Posts/posts.module";
import { PostsRepoModule } from "../Posts/Repo/postsRepo.module";
import { UsersRepoModule } from "../Users/Repo/usersRepo.module";
@Module({
    imports: [CommentRepoModule, UsersRepoModule, PostsRepoModule],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentModule { }